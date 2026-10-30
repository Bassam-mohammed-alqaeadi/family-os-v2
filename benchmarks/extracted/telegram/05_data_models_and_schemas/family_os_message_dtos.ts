/**
 * =========================================================================
 * Family OS Managed Instant Messaging Contracts (TypeScript DTOs)
 * =========================================================================
 *
 * Direct production contracts adapted from Telegram Core for Family OS (Decision D-019).
 * Specifications defined in SPEC-MINER-TG-SURVEY-3 (§6) and verified against
 * Telegram Android client reverse-engineered schemas.
 *
 * Core Principles:
 * 1. Sub-second delivery and optimistic local caching inspired by Telegram's messages_v2.
 * 2. Strict parental governance and child protection (stranger contact gate, pending approval).
 * 3. 5-bit packed 100-bar waveform metadata (63 bytes Base64) for instant voice note visualization.
 * 4. Zero-trust managed end-to-end encryption with family master key escrow.
 * 5. Monotonic sequential numbering (`seq`) per channel to detect and heal dropped updates.
 */

export type FamilyRole = 'parent' | 'child' | 'guardian';

export type MessageContentType =
  | 'text'
  | 'voice_note'
  | 'image'
  | 'video'
  | 'live_location'
  | 'system_alert';

export type DeliveryState =
  | 'draft'
  | 'pending_approval'
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'rejected';

/**
 * Waveform Metadata Contract for Voice Notes (Requirement R4 / R5)
 * Matches Telegram's 5-bit packed 100-bar waveform bitstream (63 bytes).
 */
export interface VoiceWaveformMetadata {
  /** Array of 100 normalized peak amplitude values in range [0..31] */
  bars: number[];
  /** 63-byte base64-encoded compressed bitstream string */
  bitstream_base64: string;
  /** Duration in seconds */
  duration_seconds: number;
  /** Audio codec used (strictly Opus 48kHz mono) */
  codec: 'audio/opus';
  /** Sampling frequency in Hz */
  sample_rate_hz: 48000;
}

/**
 * Live Location Streaming Payload (Requirement R4 / R5)
 * Direct telemetry structure for child safe zones and location sharing.
 */
export interface LiveLocationPayload {
  latitude: number;
  longitude: number;
  accuracy_meters: number;
  heading_degrees?: number;
  speed_mps?: number;
  expires_at: string; // ISO 8601 UTC
  proximity_alert_radius_meters?: number;
}

/**
 * Security & Encryption Metadata Container
 * Enforces Decision D-019 managed E2EE with parental approval hooks.
 */
export interface MessageSecurityMetadata {
  /** Managed encryption mode: keys derived from family root master key */
  mode: 'family_managed_e2ee';
  /** Key identifier used to encrypt payload */
  key_id: string;
  /** Initialization vector for AES-256-GCM (12 bytes Base64) */
  iv_base64: string;
  /** Authentication tag for tamper detection (16 bytes Base64) */
  auth_tag_base64: string;
  /** Whether this message was trapped by parental governance filters */
  approval_required: boolean;
  /** User ID of the parent who approved the transmission */
  approved_by_parent_id?: string;
}

/**
 * Master Managed Message Envelope (Requirement R5)
 * Governs all end-to-end transmissions within Family OS NestJS server and Flutter client.
 */
export interface FamilyMessageEnvelope {
  /** Globally unique UUIDv7 (time-ordered monotonic ID) */
  id: string;
  /** Multi-tenant Family ID for PostgreSQL RLS isolation */
  family_id: string;
  /** Unique Chat Thread / Channel identifier */
  thread_id: string;
  /** Sender Device ID */
  sender_device_id: string;
  /** Sender User ID */
  sender_user_id: string;
  /** Sender Family Role */
  sender_role: FamilyRole;
  /** Monotonic sequential packet number per channel (prevents message drops / hole detection) */
  seq: number;
  /** Creation timestamp in ISO 8601 UTC */
  sent_at: string;
  /** Content classification */
  content_type: MessageContentType;
  /** Message delivery / approval state machine */
  delivery_state: DeliveryState;
  
  /** Parental Supervision & Security Metadata */
  security: MessageSecurityMetadata;

  /** Encrypted Ciphertext Payload (Base64) */
  encrypted_payload: string;

  /** Lightweight Unencrypted Metadata for instant UI rendering without payload decryption */
  media_metadata?: {
    voice?: VoiceWaveformMetadata;
    location?: LiveLocationPayload;
    media_file_size_bytes?: number;
    mime_type?: string;
    thumbnail_blurhash?: string;
  };

  /** Thread / Reply Context */
  reply_context?: {
    reply_to_message_id: string;
    reply_to_user_id: string;
    snippet_preview?: string;
  };
}

/**
 * Contact Approval Request DTO for Stranger Protection (Requirement R4 / R5)
 * Prevents unknown external entities from establishing communication with children.
 */
export interface ContactApprovalRequestDTO {
  request_id: string;
  family_id: string;
  child_user_id: string;
  stranger_contact: {
    phone_number?: string;
    display_name: string;
    avatar_url?: string;
    initial_message_preview?: string;
  };
  requested_at: string; // ISO 8601 UTC
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  resolved_at?: string; // ISO 8601 UTC
  resolved_by_parent_id?: string;
}

/**
 * WebRTC P2P VoIP Signaling Envelope (Requirement R4 / R5)
 * Replicates Telegram's P2P session negotiation with 4-emoji visual verification.
 */
export interface VoIPSignalingMessageDTO {
  call_id: string;
  caller_user_id: string;
  callee_user_id: string;
  family_id: string;
  type: 'offer' | 'answer' | 'ice_candidate' | 'busy' | 'hangup';
  sdp?: string;
  candidate?: {
    candidate: string;
    sdpMid: string;
    sdpMLineIndex: number;
  };
  /** 4-Emoji visual verification fingerprint derived from DH secret hash */
  emoji_fingerprint?: [string, string, string, string];
  timestamp: string; // ISO 8601 UTC
}

/**
 * =========================================================================
 * Helper Type Guards & Waveform Utilities
 * =========================================================================
 */

export function isFamilyMessageEnvelope(obj: unknown): obj is FamilyMessageEnvelope {
  if (typeof obj !== 'object' || obj === null) return false;
  const env = obj as Record<string, unknown>;
  return (
    typeof env.id === 'string' &&
    typeof env.family_id === 'string' &&
    typeof env.thread_id === 'string' &&
    typeof env.sender_user_id === 'string' &&
    typeof env.seq === 'number' &&
    typeof env.sent_at === 'string' &&
    typeof env.encrypted_payload === 'string' &&
    typeof env.security === 'object' &&
    env.security !== null
  );
}

export function isVoiceWaveformMetadata(obj: unknown): obj is VoiceWaveformMetadata {
  if (typeof obj !== 'object' || obj === null) return false;
  const meta = obj as Record<string, unknown>;
  return (
    Array.isArray(meta.bars) &&
    typeof meta.bitstream_base64 === 'string' &&
    typeof meta.duration_seconds === 'number' &&
    meta.codec === 'audio/opus' &&
    meta.sample_rate_hz === 48000
  );
}

export function isContactApprovalRequestDTO(obj: unknown): obj is ContactApprovalRequestDTO {
  if (typeof obj !== 'object' || obj === null) return false;
  const req = obj as Record<string, unknown>;
  return (
    typeof req.request_id === 'string' &&
    typeof req.family_id === 'string' &&
    typeof req.child_user_id === 'string' &&
    typeof req.stranger_contact === 'object' &&
    typeof req.status === 'string'
  );
}

export function isVoIPSignalingMessageDTO(obj: unknown): obj is VoIPSignalingMessageDTO {
  if (typeof obj !== 'object' || obj === null) return false;
  const sig = obj as Record<string, unknown>;
  return (
    typeof sig.call_id === 'string' &&
    typeof sig.caller_user_id === 'string' &&
    typeof sig.callee_user_id === 'string' &&
    typeof sig.family_id === 'string' &&
    typeof sig.type === 'string'
  );
}

/**
 * 5-Bit Waveform Unpacker in TypeScript
 * Reconstructs 100 amplitude bars from a 63-byte Uint8Array / Buffer.
 */
export function unpackWaveformBitstream(bytes: Uint8Array): number[] {
  if (bytes.length === 0) return [];
  const totalBits = bytes.length * 8;
  const totalSamples = Math.floor(totalBits / 5);
  const result: number[] = new Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const bitOffset = i * 5;
    const byteOffset = Math.floor(bitOffset / 8);
    const bitInByte = bitOffset % 8;

    let value: number;
    if (bitInByte <= 3) {
      value = (bytes[byteOffset] >> bitInByte) & 0x1f;
    } else {
      const b1 = bytes[byteOffset];
      const b2 = byteOffset + 1 < bytes.length ? bytes[byteOffset + 1] : 0;
      const part1 = b1 >> bitInByte;
      const bitsFromPart1 = 8 - bitInByte;
      const bitsNeededFromPart2 = 5 - bitsFromPart1;
      const part2 = (b2 & ((1 << bitsNeededFromPart2) - 1)) << bitsFromPart1;
      value = (part1 | part2) & 0x1f;
    }
    result[i] = value;
  }
  return result;
}

/**
 * 5-Bit Waveform Packer in TypeScript
 * Compresses 100 amplitude bars into a 63-byte Uint8Array.
 */
export function packWaveformBitstream(bars: number[]): Uint8Array {
  const totalBits = bars.length * 5;
  const byteCount = Math.ceil(totalBits / 8);
  const result = new Uint8Array(byteCount);

  for (let i = 0; i < bars.length; i++) {
    const sample = Math.max(0, Math.min(31, Math.round(bars[i])));
    const bitOffset = i * 5;

    for (let bit = 0; bit < 5; bit++) {
      if ((sample >> bit) & 1) {
        const targetBit = bitOffset + bit;
        const targetByte = Math.floor(targetBit / 8);
        const bitInByte = targetBit % 8;
        result[targetByte] |= 1 << bitInByte;
      }
    }
  }
  return result;
}
