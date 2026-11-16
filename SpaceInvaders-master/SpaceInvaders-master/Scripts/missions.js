/* Ten missions and their first two questions. Each option is [text, correct, why]. */
window.IOT_MISSIONS = [
  {
    "title": "Authentication",
    "objective": "Identify each sensor before connecting to MQTT.",
    "risk": "An unknown device impersonates a trusted sensor.",
    "decisions": [
      {
        "prompt": "A new sensor requests a broker connection. Choose identity checks.",
        "options": [
          [
            "Trust its IP address",
            false,
            "Addresses can change or be spoofed; they do not prove identity."
          ],
          [
            "Verify a unique device identity",
            true,
            "Authentication proves which device is connecting before a session is created."
          ],
          [
            "Allow anonymous connections",
            false,
            "Anonymous clients let an attacker join without proving an identity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authentication leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A sensor fails its identity check. What should the broker do?",
        "options": [
          [
            "Deny and log the connection",
            true,
            "Failing closed blocks unauthenticated devices and leaves evidence for investigation."
          ],
          [
            "Allow access during an outage",
            false,
            "A fail-open path bypasses authentication when the system is under stress."
          ],
          [
            "Trust its device display name",
            false,
            "A display name is a claim, not cryptographic proof of identity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authentication leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Authorisation",
    "objective": "Limit the actions an authenticated sensor may perform.",
    "risk": "A compromised sensor changes an actuator setting.",
    "decisions": [
      {
        "prompt": "The temperature sensor is authenticated. Assign its role.",
        "options": [
          [
            "Broker administrator",
            false,
            "An authenticated device still needs restricted permissions; identity is not permission."
          ],
          [
            "Read and write every topic",
            false,
            "Broad permissions let one compromised identity control unrelated devices."
          ],
          [
            "Publish its own telemetry only",
            true,
            "Least privilege limits what a known device can do after authentication."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authorisation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "An operator leaves the team. How do you handle their permissions?",
        "options": [
          [
            "Keep access for convenience",
            false,
            "Unused permissions leave an avoidable route into the system."
          ],
          [
            "Revoke access immediately",
            true,
            "Permissions must follow current responsibilities, including removal when someone leaves."
          ],
          [
            "Share their account with a replacement",
            false,
            "Shared accounts prevent reliable attribution and individual revocation."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping authorisation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "TLS encryption",
    "objective": "Protect MQTT traffic on an untrusted network.",
    "risk": "A nearby attacker reads or alters sensor traffic.",
    "decisions": [
      {
        "prompt": "Choose the MQTT transport for the public network.",
        "options": [
          [
            "Plain MQTT on port 1883",
            false,
            "Plain MQTT exposes messages and credentials to observers on the network."
          ],
          [
            "TLS 1.2+ with peer verification",
            true,
            "TLS protects confidentiality and integrity when the peer certificate is verified."
          ],
          [
            "Base64-encode the payload",
            false,
            "Base64 is reversible encoding and provides no encryption or integrity protection."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping tls encryption leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "TLS reports a hostname mismatch. Choose a response.",
        "options": [
          [
            "Disable certificate verification",
            false,
            "Encryption without peer verification can connect securely to an attacker."
          ],
          [
            "Fall back to plain MQTT",
            false,
            "Downgrading the connection exposes traffic instead of resolving the trust failure."
          ],
          [
            "Reject; fix the hostname/certificate",
            true,
            "Hostname verification binds the certificate to the intended broker."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping tls encryption leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Access Control Lists",
    "objective": "Implement exact MQTT publish and subscribe permissions.",
    "risk": "A wildcard ACL exposes other devices' messages.",
    "decisions": [
      {
        "prompt": "Write sensor-07's publish ACL.",
        "options": [
          [
            "Allow publish factory/#",
            false,
            "A broad wildcard grants access to unrelated topics and future devices."
          ],
          [
            "Allow publish factory/s07/telemetry",
            true,
            "A narrow ACL enforces the specific resource permission assigned to this identity."
          ],
          [
            "Allow publish #",
            false,
            "A global wildcard lets a compromised client publish almost anywhere."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping access control lists leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "No ACL rule matches a request. Choose the default.",
        "options": [
          [
            "Deny unmatched operations",
            true,
            "Default deny keeps new resources closed until an explicit rule allows access."
          ],
          [
            "Allow unmatched operations",
            false,
            "Default allow makes missing ACL rules a silent grant of access."
          ],
          [
            "Let the client decide",
            false,
            "The broker must enforce ACLs; an untrusted client cannot enforce its own limits."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping access control lists leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Strong credentials",
    "objective": "Provision unique credentials and replace exposed secrets.",
    "risk": "A leaked shared password compromises the whole fleet.",
    "decisions": [
      {
        "prompt": "Choose credentials for 100 new sensors.",
        "options": [
          [
            "Factory default admin/admin",
            false,
            "Known defaults are easy to guess and are often tested automatically by attackers."
          ],
          [
            "One long password for every sensor",
            false,
            "A shared secret turns a single-device leak into a fleet-wide compromise."
          ],
          [
            "Unique random secret per device",
            true,
            "Unique high-entropy credentials resist guessing and limit the reach of one leak."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping strong credentials leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A device secret appears in a public log. Choose a response.",
        "options": [
          [
            "Only delete the log",
            false,
            "Copies may already exist; deleting a log does not revoke the exposed secret."
          ],
          [
            "Revoke and replace that secret",
            true,
            "Rotation ends the usefulness of the leaked secret; investigate how it escaped too."
          ],
          [
            "Append a digit to the old secret",
            false,
            "A predictable variation is easier to guess than a newly generated independent secret."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping strong credentials leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Certificate management",
    "objective": "Maintain trusted, valid certificates throughout their lifecycle.",
    "risk": "An expired or stolen certificate disrupts trusted connections.",
    "decisions": [
      {
        "prompt": "The broker certificate expires in seven days. Plan maintenance.",
        "options": [
          [
            "Automate renewal and expiry alerts",
            true,
            "Renewal plus monitoring prevents expiry outages and catches failed renewal jobs."
          ],
          [
            "Wait until clients disconnect",
            false,
            "Waiting for expiry creates an avoidable outage and pressures teams to bypass verification."
          ],
          [
            "Accept expired certificates",
            false,
            "Ignoring validity removes an essential part of certificate trust checks."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping certificate management leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A device private key is stolen. Choose the recovery action.",
        "options": [
          [
            "Renew using the same key",
            false,
            "A new certificate with the stolen key still lets the attacker impersonate the device."
          ],
          [
            "Change only the device name",
            false,
            "Renaming the device does not invalidate the stolen cryptographic identity."
          ],
          [
            "Revoke; generate a new key/cert",
            true,
            "Revocation and a fresh key stop reuse; distribute revocation enforcement to peers."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping certificate management leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Network segmentation",
    "objective": "Separate IoT devices from management and office networks.",
    "risk": "A compromised IoT device moves into the office network.",
    "decisions": [
      {
        "prompt": "Choose a network layout for the sensor fleet.",
        "options": [
          [
            "Put everything on one flat LAN",
            false,
            "A flat network makes lateral movement easier after any device is compromised."
          ],
          [
            "IoT VLAN with controlled routing",
            true,
            "Segmentation creates boundaries; controlled inter-VLAN routing enforces them."
          ],
          [
            "Give devices different hostnames",
            false,
            "Names do not create a network boundary or limit connectivity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping network segmentation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "An office laptop needs sensor data. Choose its access path.",
        "options": [
          [
            "Approved broker gateway only",
            true,
            "A narrow, monitored path reduces exposure across the network boundary."
          ],
          [
            "Bridge the VLANs together",
            false,
            "Bridging removes the isolation the VLAN design was meant to provide."
          ],
          [
            "Allow every inter-VLAN connection",
            false,
            "Permissive routing defeats segmentation even when VLAN labels are present."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping network segmentation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Firewall configuration",
    "objective": "Permit necessary traffic and close unneeded network paths.",
    "risk": "An exposed management port allows remote intrusion.",
    "decisions": [
      {
        "prompt": "Set the IoT network's outbound firewall policy.",
        "options": [
          [
            "Allow all destinations and ports",
            false,
            "Unrestricted egress gives malware more routes for control and data theft."
          ],
          [
            "Block all traffic, including MQTT",
            false,
            "A firewall must support required service paths while denying unnecessary ones."
          ],
          [
            "Allow broker:8883 and approved services",
            true,
            "Explicit destinations and ports limit exposure while preserving required connectivity."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping firewall configuration leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A supplier requests public SSH to every sensor.",
        "options": [
          [
            "Open port 22 to the internet",
            false,
            "Public management interfaces attract scanning and credential attacks."
          ],
          [
            "Use a restricted management gateway",
            true,
            "A controlled management path limits who can reach administrative interfaces."
          ],
          [
            "Open all inbound ports temporarily",
            false,
            "A temporary broad rule creates unnecessary exposure and may be forgotten."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping firewall configuration leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Secure topic design",
    "objective": "Separate telemetry and commands with predictable narrow namespaces.",
    "risk": "Ambiguous topics mix device data and actuator commands.",
    "decisions": [
      {
        "prompt": "Choose the topic namespace for sensor 07.",
        "options": [
          [
            "factory/s07/telemetry and /commands",
            true,
            "Separate per-device channels make precise ACLs and monitoring possible; ACLs still enforce access."
          ],
          [
            "One global data topic for everything",
            false,
            "A shared topic makes per-device permissions and command separation difficult."
          ],
          [
            "Put the password inside the topic",
            false,
            "Topics appear in logs and subscriptions; topic names must not carry secrets."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping secure topic design leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "Choose how actuator commands should be delivered.",
        "options": [
          [
            "Retain every command indefinitely",
            false,
            "A newly connected actuator may replay a stale retained command."
          ],
          [
            "Use the same topic as telemetry",
            false,
            "Mixing commands and readings makes authority and message handling ambiguous."
          ],
          [
            "Separate commands; check freshness",
            true,
            "Dedicated command topics plus expiry/sequence checks reduce accidental stale-command execution."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping secure topic design leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  },
  {
    "title": "Input validation",
    "objective": "Validate untrusted MQTT payloads before using them.",
    "risk": "A malformed payload crashes or manipulates an actuator.",
    "decisions": [
      {
        "prompt": "An actuator receives {temperature: 'hot'}. Choose validation.",
        "options": [
          [
            "Trust it because MQTT used TLS",
            false,
            "TLS protects transport, but an authenticated sender can still send invalid data."
          ],
          [
            "Check schema, type, range and size",
            true,
            "Explicit validation rejects malformed, oversized or out-of-range data before it reaches control logic."
          ],
          [
            "Convert any string to a command",
            false,
            "Implicit conversion can turn unexpected input into unintended actions."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping input validation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      },
      {
        "prompt": "A payload contains shell text. Choose a processing method.",
        "options": [
          [
            "Execute it to discover its meaning",
            false,
            "Executing message text turns untrusted data into arbitrary code execution."
          ],
          [
            "Remove spaces, then execute it",
            false,
            "Simple text filtering does not make shell execution safe."
          ],
          [
            "Reject it; use a fixed command allowlist",
            true,
            "Treat payloads as data and map validated values to predefined actions, without shell evaluation."
          ],
          [
            "Skip this control to save time",
            false,
            "Skipping input validation leaves the stated threat untreated; record and manage that risk."
          ]
        ]
      }
    ]
  }
];
