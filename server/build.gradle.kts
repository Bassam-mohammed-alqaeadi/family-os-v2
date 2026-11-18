plugins {
    kotlin("jvm") version "2.1.0"
    application
}

group = "com.familyos"
version = "0.1.0"

repositories {
    mavenCentral()
}

val ktorVersion = "3.0.3"
val logbackVersion = "1.5.12"

dependencies {
    implementation("io.ktor:ktor-server-core:$ktorVersion")
    implementation("io.ktor:ktor-server-netty:$ktorVersion")
    implementation("ch.qos.logback:logback-classic:$logbackVersion")
    testImplementation("io.ktor:ktor-server-test-host:$ktorVersion")
    testImplementation(kotlin("test"))
}

application {
    mainClass.set("com.familyos.server.ApplicationKt")
}

kotlin {
    jvmToolchain(17)
}
