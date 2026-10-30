package com.familyos.multifamily

import com.familyos.preferences.AppPrefsHelper
import com.familyos.util.ObjectUtil
import com.familyos.util.exception.ExceptionUtil
import com.familyos.util.log.Log
import java.util.concurrent.Executor

/**
 * MultiFamilyManager - Clean Room Implementation
 * 
 * Reverse-engineered from com.familywall.multifamily.MultiFamilyManager
 * 
 * Manages multiple family circles (households) for a single user account.
 * Supports: parents' home, grandparents' home, separated families, etc.
 * 
 * Key Features:
 * - Singleton pattern with thread-safe scope switching
 * - Persists current family scope in SharedPreferences via AppPrefsHelper
 * - On scope change: invalidates caches, refreshes dashboard, triggers network sync
 * - Rollback mechanism on FizFamilyDoesNotExistException
 * - Async/sync execution modes for scope switching
 */

class MultiFamilyManager private constructor(
    private val context: android.content.Context,
    private val prefsHelper: AppPrefsHelper,
    private val asyncExecutor: Executor,
    private val dashboardInvalidator: () -> Unit,
    private val cacheRequestFactory: () -> CacheRequest
) {
    
    companion object {
        private const val NO_FAMILY_SCOPE = "NO_FAMILY_SCOPE"
        private const val PARAM_SCOPE = "scope"
        private var INSTANCE: MultiFamilyManager? = null
        private val lock = Any()
        
        fun initialize(
            context: android.content.Context,
            prefsHelper: AppPrefsHelper,
            asyncExecutor: Executor,
            dashboardInvalidator: () -> Unit,
            cacheRequestFactory: () -> CacheRequest
        ): MultiFamilyManager {
            synchronized(lock) {
                if (INSTANCE == null) {
                    INSTANCE = MultiFamilyManager(
                        context, prefsHelper, asyncExecutor, 
                        dashboardInvalidator, cacheRequestFactory
                    )
                }
                return INSTANCE!!
            }
        }
        
        fun get(): MultiFamilyManager = INSTANCE ?: throw IllegalStateException("MultiFamilyManager not initialized. Call initialize() first.")
    }
    
    @Volatile
    private var currentFamilyScope: String? = null
    
    /**
     * Switches to a new family scope (circle).
     * 
     * @param newFamilyScope The MetaId string of the target family
     * @param invalidateStuff Whether to invalidate UI caches and refresh dashboard
     * @param async Whether to run invalidation asynchronously
     * @param justCreatedAccount Whether this is a newly created account (skips extended family fetch)
     */
    fun setFamilyScope(
        newFamilyScope: String,
        invalidateStuff: Boolean = true,
        async: Boolean = true,
        justCreatedAccount: Boolean = false
    ) {
        if (newFamilyScope.isNullOrBlank()) return
        
        Log.d("setFamilyScope newFamilyScope=%s", newFamilyScope)
        
        if (ObjectUtil.equals(prefsHelper.currentFamilyScope, newFamilyScope)) {
            Log.d("setFamilyScope Keeping current family scope %s", newFamilyScope)
            return
        }
        
        Log.d("setFamilyScope Saving new family scope %s", newFamilyScope)
        prefsHelper.currentFamilyScope = newFamilyScope
        
        val previousScope = currentFamilyScope
        currentFamilyScope = newFamilyScope
        
        if (invalidateStuff) {
            dashboardInvalidator()
            
            val runnable = Runnable {
                performScopeSwitchCleanup(
                    justCreatedAccount = justCreatedAccount,
                    previousScope = previousScope,
                    async = async
                )
            }
            
            if (async) {
                asyncExecutor.execute(runnable)
            } else {
                runnable.run()
            }
        }
    }
    
    /**
     * Performs post-scope-switch cleanup: fetches account state and extended family list.
     * Rolls back to previous scope if the new family no longer exists.
     */
    private fun performScopeSwitchCleanup(
        justCreatedAccount: Boolean,
        previousScope: String?,
        async: Boolean
    ) {
        try {
            val cacheRequest = cacheRequestFactory()
            val dataAccess = DataAccessFactory.getDataAccess()
            
            // Fetch account state for new scope
            dataAccess.getAccountState(cacheRequest, CacheControl.NETWORK)
            
            // Fetch extended family list unless just created account
            if (justCreatedAccount) {
                dataAccess.getExtendedFamilyList(cacheRequest, CacheControl.NETWORK)
            }
            
            cacheRequest.addCallback(object : IFutureCallback<Boolean> {
                override fun onResult(data: Boolean?) {
                    // Success - scope switch complete
                }
                
                override fun onException(exception: Exception) {
                    if (ExceptionUtil.hasCause(exception, FizFamilyDoesNotExistException::class.java)) {
                        Log.w("setFamilyScope Caught 'FamilyDoesNotExist' exception: rolling back to previous scope")
                        currentFamilyScope = previousScope
                        prefsHelper.currentFamilyScope = previousScope ?: NO_FAMILY_SCOPE
                    }
                }
            })
            
            if (async) {
                cacheRequest.doIt()
            } else {
                cacheRequest.doItInThisThread()
                cacheRequest.get()
            }
            
        } catch (th: Throwable) {
            Log.w(th, "setFamilyScope error, rolling back to previous scope")
            currentFamilyScope = previousScope
            prefsHelper.currentFamilyScope = previousScope ?: NO_FAMILY_SCOPE
        }
    }
    
    /** Returns current family scope, loading from prefs if needed */
    fun getFamilyScope(): String {
        if (currentFamilyScope == null) {
            val scope = prefsHelper.currentFamilyScope
            currentFamilyScope = scope
            if (scope == null) return NO_FAMILY_SCOPE
        }
        return currentFamilyScope!!
    }
    
    /** Checks if user has any family scope set */
    fun hasFamilyScope(): Boolean {
        val scope = prefsHelper.currentFamilyScope
        currentFamilyScope = scope
        return scope != null
    }
    
    /** Clears current family scope (logout) */
    fun resetFamilyScope() {
        prefsHelper.removeCurrentFamilyScope()
        currentFamilyScope = null
    }
    
    /**
     * Initializes family scope on first login.
     * Calls IAccountApiFutured.getLoggedFamily() to get the primary family.
     */
    @Throws(Exception::class)
    fun initializeFamilyScope() {
        val request = ApiClientRequestFactory.newRequest(null)
        val loggedFamilyFuture = (request.getStub(IAccountApiFutured::class.java) as IAccountApiFutured).getLoggedFamily()
        request.doRequestAsync().get() // Blocking wait
        
        val familyMetaId = (loggedFamilyFuture.get() as IFamily).metaId.toString()
        currentFamilyScope = familyMetaId
        Log.d("initialize currentFamilyScope=%s", familyMetaId)
        prefsHelper.currentFamilyScope = familyMetaId
    }
    
    /** Returns current scope as MetaId for API calls */
    fun getFamilyScopeAsMetaId(): MetaId = MetaId.parse(getFamilyScope(), true)
}

// ============================================================================
// DATA MODELS
// ============================================================================

/**
 * CircleInfo - Represents a family circle (household)
 * Originally a Kotlin data class compiled from CircleInfo.kt
 */
data class CircleInfo(
    val familyId: String,           // MetaId string of the family
    val isPremium: Boolean,         // Whether this family has premium subscription
    val isFirstFamily: Boolean,     // Whether this is the user's first/primary family
    val memberCount: Int,           // Number of members in this circle
    val creationDate: java.util.Date, // When this circle was created
    val role: String?               // User's role in this circle (ORGANIZER, PARENT, CHILD, etc.)
)

/**
 * UserInfo - Current user's account and subscription info across all circles
 * Originally a Kotlin data class compiled from UserInfo.kt
 */
data class UserInfo(
    val accountId: Long,
    val email: String?,
    val firstName: String,
    val creditType: CreditTypeEnum?,
    val subscriptionStatus: CreditStatusEnum?,
    val subscriptionPlatform: CreditPaymentTypeEnum?,
    val planInterval: CreditTypeOfPeriodEnum?,
    val creationDate: java.util.Date,
    val circleInfo: CircleInfo?       // Current active circle
) {
    /** Convenience: get current family ID from circle info */
    fun getCurrentFamilyId(): String? = circleInfo?.familyId
}

// ============================================================================
// API INTERFACES (from com.jeronimo.fiz.api)
// ============================================================================

interface IAccountApiFutured {
    fun getLoggedFamily(): FutureResult<IFamily>
}

interface IFamily {
    val metaId: MetaId
}

interface MetaId {
    fun toString(): String
    companion object {
        fun parse(str: String, strict: Boolean): MetaId
    }
}

// Placeholder enums from Fiz API
enum class CreditTypeEnum { FREE, PREMIUM, TRIAL }
enum class CreditStatusEnum { ACTIVE, EXPIRED, CANCELLED, PENDING }
enum class CreditPaymentTypeEnum { GOOGLE_PLAY, APP_STORE, STRIPE, INTERNAL }
enum class CreditTypeOfPeriodEnum { MONTHLY, YEARLY, LIFETIME }

// ============================================================================
// SUPPORTING INTERFACES
// ============================================================================

interface AppPrefsHelper {
    var currentFamilyScope: String?
    fun removeCurrentFamilyScope()
    companion object {
        fun get(context: android.content.Context): AppPrefsHelper
    }
}

interface DataAccessFactory {
    companion object {
        fun getDataAccess(): DataAccess
        fun newCacheRequest(request: IApiClientRequest): CacheRequest
    }
}

interface DataAccess {
    fun getAccountState(request: CacheRequest, control: CacheControl)
    fun getExtendedFamilyList(request: CacheRequest, control: CacheControl)
}

interface CacheRequest {
    fun addCallback(callback: IFutureCallback<Boolean>)
    fun doIt()
    fun doItInThisThread()
    fun get()
}

interface IApiClientRequest {
    fun <T> getStub(clazz: Class<T>): T
    fun doRequestAsync(): FutureResult<Unit>
}

interface IFutureCallback<T> {
    fun onResult(data: T?)
    fun onException(exception: Exception)
}

interface CacheControl {
    companion object {
        val NETWORK: CacheControl
        val CACHE: CacheControl
        val CACHE_AND_NETWORK_IF_STALE: CacheControl
    }
}

class ApiClientRequestFactory {
    companion object {
        fun newRequest(familyScope: String? = null): IApiClientRequest
    }
}

interface ExceptionUtil {
    companion object {
        fun hasCause(exception: Exception, causeClass: Class<*>): Boolean
    }
}

class FizFamilyDoesNotExistException : Exception()