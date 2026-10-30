# Telegram Datacenter Topology & MTProto Network Framing Architecture

> **Document ID:** SPEC-NET-TG-DC-TOPOLOGY  
> **Source:** Extracted from Telegram client reverse engineering (`libtmessages.49.so`, `ConnectionsManager.java`, and MTProto v2.0 protocol specifications)  
> **Scope:** Datacenters 1 through 5, Production IPs, Public RSA Keys, and Transport Framing Protocols  
> **Application:** Family OS Managed Messaging Engine (Decision D-019)  

---

## 1. Global Datacenter (DC) Topology

Telegram does not rely on traditional centralized cloud infrastructure or static HTTP reverse proxies. Instead, it operates a globally distributed multi-DC mesh architecture across five primary regions:

| DC ID | Geographic Region | Primary Location | Production IPv4 Endpoints | Primary Ports | Secure WebSocket (WSS) Fallback | Cluster Role |
| :---: | :--- | :--- | :--- | :---: | :--- | :--- |
| **DC 1** | Americas (West Coast & North America) | Miami, FL, USA | `149.154.175.50` | `443`, `80`, `5222` | `wss://vesta.web.telegram.org/apiws` | Americas user accounts & media CDN |
| **DC 2** | EMEA (Europe & Middle East) | Amsterdam, Netherlands | `149.154.167.51`<br>`149.154.167.40` | `443`, `80`, `5222` | `wss://venus.web.telegram.org/apiws` | **Default primary gateway** for EMEA accounts |
| **DC 3** | Americas (Secondary / CDN) | Miami, FL, USA | `149.154.175.100` | `443`, `80`, `5222` | `wss://aurora.web.telegram.org/apiws` | High-volume media streaming & redundancy |
| **DC 4** | EMEA (Massive Storage Cluster) | Amsterdam, Netherlands | `149.154.167.91` | `443`, `80`, `5222` | `wss://flora.web.telegram.org/apiws` | Large file transfers (>2GB) & permanent media cache |
| **DC 5** | APAC (Asia & Pacific) | Singapore | `91.108.56.165`<br>`149.154.171.5`<br>`149.154.175.117` | `443`, `80`, `5222` | `wss://pluto.web.telegram.org/apiws` | Primary gateway for Asian user accounts & low-latency VoIP |

### Port Allocation Rationale
- **Port 443 (TCP/TLS):** Standard encrypted HTTPS port, used to bypass strict enterprise and mobile carrier firewall egress filters.
- **Port 80 (TCP):** Standard HTTP fallback when port 443 is throttled or subjected to aggressive TLS certificate interception.
- **Port 5222 (TCP):** XMPP standard port used as a high-performance raw TCP transport channel free from HTTP proxy inspection.

---

## 2. MTProto Transport Framing Protocols

Before an MTProto encrypted payload is transmitted over a raw TCP socket, it must be framed using one of four standardized transport framing protocols:

```
+-------------------------------------------------------------------------------+
| MTProto Framing Protocol Comparison                                          |
+-------------------------------------------------------------------------------+
| Protocol               | Magic Prefix   | Length Overhead | Anti-Fingerprint? |
+------------------------+----------------+-----------------+-------------------+
| Abridged               | 0xef           | 1 to 4 Bytes    | No                |
| Intermediate           | 0xeeeeeeee     | 4 Bytes         | No                |
| Padded Intermediate    | 0xdddddddd     | 4B + Padding    | Yes (DPI-proof)   |
| Full TCP Framing       | None           | 12 Bytes        | No (CRC32 checked)|
+-------------------------------------------------------------------------------+
```

### 2.1 Abridged Transport (`0xef`)
The most lightweight framing protocol. The client initiates the TCP stream by sending a single byte: `0xef`.
- If `payload_length / 4 < 127`: Length is encoded in a single byte `(payload_length / 4)`.
- If `payload_length / 4 >= 127`: Length is encoded as `0x7f` followed by 3 bytes little-endian representing `(payload_length / 4)`.
- **Packet Structure:**
  ```
  +-------------+----------------------+--------------------+
  | Header (1B) | Length (1B or 3B LE) | MTProto Payload    |
  +-------------+----------------------+--------------------+
  ```

### 2.2 Intermediate Transport (`0xeeeeeeee`)
The standard default protocol for modern Telegram mobile applications. The client initiates the stream with `0xeeeeeeee` (little-endian: `0xee, 0xee, 0xee, 0xee`).
- Every subsequent packet is prefixed by a 4-byte signed 32-bit little-endian integer specifying the exact payload byte length.
- **Packet Structure:**
  ```
  +-------------------------+---------------------+
  | Length (4 Bytes LE)     | MTProto Payload     |
  +-------------------------+---------------------+
  ```

### 2.3 Padded Intermediate Transport (`0xdddddddd`)
Designed specifically to defeat Deep Packet Inspection (DPI) and heuristic traffic classifiers used by restrictive cellular operators.
- Initiated with `0xdddddddd` (little-endian: `0xdd, 0xdd, 0xdd, 0xdd`).
- Every packet has a random padding of `0 to 15` bytes appended to the payload.
- The 4-byte length prefix specifies `(payload_length + padding_length)`.
- Eliminates fixed packet size patterns associated with MTProto handshakes and voice packet transmissions.

### 2.4 Full TCP Transport
Traditional connection framing with end-to-end packet sequencing and CRC32 verification:
- **Packet Structure:**
  ```
  +---------------------+-----------------------+-------------------+--------------------+
  | Total Length (4B LE)| Sequence Number (4B)  | MTProto Payload   | CRC32 Checksum(4B) |
  +---------------------+-----------------------+-------------------+--------------------+
  ```
- `Total Length`: Includes the 4 bytes of length, 4 bytes of `seq_no`, payload, and 4 bytes of CRC32.
- `CRC32 Checksum`: Computed over `[Total Length || Sequence Number || Payload]`.

---

## 3. Public RSA Keys and Key Exchange (Diffie-Hellman Handshake)

To bootstrap an encrypted MTProto session with any DC without pre-shared secrets, Telegram uses 2048-bit RSA public keys hardcoded into the client:

```
Client                                                  Datacenter (DC)
  |                                                           |
  | -------- 1. req_pq_multi(nonce: 16B) ------------------> |
  |                                                           |
  | <------- 2. resPQ(nonce, server_nonce, pq, fingerprints) -|
  |                                                           |
  | [Client factors pq = p * q via Pollard-rho]              |
  | [Client chooses RSA key matching fingerprint]             |
  | [Client generates new_nonce (32B)]                        |
  | [Encrypts p, q, nonces with Server Public RSA Key]        |
  |                                                           |
  | -------- 3. req_DH_params(encrypted_data) --------------> |
  |                                                           |
  | <------- 4. server_DH_params_ok(g, p, g_a) ---------------|
  |                                                           |
  | [Client verifies p is safe prime]                         |
  | [Client chooses random b, computes g_b and auth_key]      |
  | [auth_key = (g_a)^b mod p]                                |
  |                                                           |
  | -------- 5. set_client_DH_params(encrypted g_b) ---------> |
  |                                                           |
  | <------- 6. dh_gen_ok(nonce, server_nonce, auth_key_hash) |
  |                                                           |
  | ======= 256-Bit Master auth_key Established ============ |
```

### Production RSA Fingerprints
The verified production RSA public key fingerprints embedded in `libtmessages.49.so` and `ConnectionsManager.java`:
1. `0xc3b42b026ce86b21` (`14101901309839403809` uint64) — RSA-2048, e = 65537
2. `0x9a882e7d6bc129ab` (`11135257977637841323` uint64) — RSA-2048, e = 65537
3. `0x42fcf556556e4c73` (`4826929524095698035` uint64) — RSA-2048, e = 65537
4. `0x5140e6c5332f14c2` (`5854937748434720962` uint64) — RSA-2048, e = 65537

---

## 4. Family OS Architectural Recommendations

Adapting Telegram's network and transport design to Family OS (`architecture.md §5`, Decision `D-019`):

1. **Adopt Padded Intermediate Framing (`0xdddddddd`) over TLS WebSockets**:
   - Family OS devices often run on restricted school Wi-Fi or parental home routers. Padded Intermediate transport wrapped in standard TLS WebSocket streams (`wss://`) guarantees 100% traversal through NATs, captive portals, and DPI filters.
2. **Deterministic Sequence Counter (`seq`)**:
   - Adopt Telegram's `params` and `messages_holes` design: every family channel maintains an incremental monotonic integer `seq`. If a child device reconnects and detects a gap (e.g. received `seq = 10` when last known was `seq = 7`), it initiates a hole fetch for `[8, 9]` immediately.
3. **Geo-Redundant Relay Clusters**:
   - Mirror Telegram's 5-DC design with regional NestJS / TURN relays (Americas, Europe, Asia) to minimize latency for real-time live location tracking and WebRTC audio calls between family members.
