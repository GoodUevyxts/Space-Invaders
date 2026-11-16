/* Four more questions per mission. Edit wording/options here; one correct answer each. */
(() => {
  const extra = [
  [
    {
      "prompt": "Two sensors connect using the same client ID. What establishes identity?",
      "options": [
        [
          "A separately verified credential for each device",
          true,
          "Client IDs label sessions; independently verified credentials establish identity."
        ],
        [
          "The client ID alone",
          false,
          "An attacker can copy a client ID; it is not proof of identity."
        ],
        [
          "The most recent connection",
          false,
          "Connection timing does not prove which device is legitimate."
        ],
        [
          "The strongest Wi-Fi signal",
          false,
          "Signal strength cannot authenticate an MQTT client."
        ]
      ]
    },
    {
      "prompt": "A laptop asks a sensor to trust a new broker. What must the sensor verify?",
      "options": [
        [
          "The broker certificate and expected hostname",
          true,
          "Authentication is needed in both directions: devices must identify their intended broker."
        ],
        [
          "Only the broker display name",
          false,
          "Display names can be copied by an impostor."
        ],
        [
          "That the broker replies quickly",
          false,
          "A fast response provides no identity assurance."
        ],
        [
          "That port 8883 is open",
          false,
          "A port number does not prove the service behind it is trusted."
        ]
      ]
    },
    {
      "prompt": "Which design supports revoking one compromised device identity?",
      "options": [
        [
          "A separate identity and credential per device",
          true,
          "Independent identities let you revoke one device without disabling the fleet."
        ],
        [
          "One shared fleet account",
          false,
          "Revoking a shared account disrupts every device that uses it."
        ],
        [
          "Anonymous MQTT sessions",
          false,
          "Anonymous sessions provide no per-device identity to revoke."
        ],
        [
          "A shared serial number",
          false,
          "A shared public label is not a separately revocable credential."
        ]
      ]
    },
    {
      "prompt": "Many failed device logins appear. Choose a broker response.",
      "options": [
        [
          "Rate-limit attempts and alert operators",
          true,
          "Rate limits slow guessing; monitoring helps detect attacks without silently removing checks."
        ],
        [
          "Disable authentication",
          false,
          "Removing authentication lets the attacker connect without guessing."
        ],
        [
          "Print passwords into logs",
          false,
          "Logging secrets creates another source of credential exposure."
        ],
        [
          "Automatically trust repeat attempts",
          false,
          "Repeated failures should not increase trust."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A dashboard user can read temperatures. May they reset a motor?",
      "options": [
        [
          "Only with an explicit motor-control permission",
          true,
          "Authorisation checks each action against the permissions assigned to that identity."
        ],
        [
          "Yes, because they are logged in",
          false,
          "Authentication does not grant every action."
        ],
        [
          "Yes, if they know the topic name",
          false,
          "Knowing a resource name does not confer permission."
        ],
        [
          "Yes, from the office Wi-Fi",
          false,
          "Network location alone is not an action permission."
        ]
      ]
    },
    {
      "prompt": "A maintenance role is needed for one hour. Choose access handling.",
      "options": [
        [
          "Time-limit the role and revoke it afterwards",
          true,
          "Short-lived permissions reduce the time a privileged account can be misused."
        ],
        [
          "Grant permanent administrator access",
          false,
          "Permanent broad privileges exceed a temporary maintenance need."
        ],
        [
          "Share an existing administrator password",
          false,
          "Shared administrator credentials reduce accountability and are difficult to revoke individually."
        ],
        [
          "Allow every sensor to perform maintenance",
          false,
          "Maintenance privileges should be limited to the identities that need them."
        ]
      ]
    },
    {
      "prompt": "Where should command authorisation be enforced?",
      "options": [
        [
          "At the broker and relevant service boundary",
          true,
          "Enforcement must happen in trusted components before a protected operation is performed."
        ],
        [
          "Only by hiding dashboard buttons",
          false,
          "A client can bypass a user interface and send requests directly."
        ],
        [
          "Only inside an untrusted sensor app",
          false,
          "A compromised client can remove its own checks."
        ],
        [
          "Only in the README",
          false,
          "Documentation cannot enforce permissions on a request."
        ]
      ]
    },
    {
      "prompt": "A device changes its requested role to admin in a message. What happens?",
      "options": [
        [
          "Ignore the claim; use server-assigned permissions",
          true,
          "Clients cannot grant themselves roles; a trusted policy determines their authority."
        ],
        [
          "Grant admin because it asked",
          false,
          "Trusting a role claimed by the caller permits privilege escalation."
        ],
        [
          "Grant admin if the message is JSON",
          false,
          "Valid JSON says nothing about whether a caller has permission."
        ],
        [
          "Grant admin if TLS is enabled",
          false,
          "TLS protects transport, not the legitimacy of requested privileges."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Which property does TLS provide for messages in transit?",
      "options": [
        [
          "Confidentiality and integrity with verified peers",
          true,
          "Correctly configured TLS protects traffic in transit and authenticates the peer."
        ],
        [
          "Automatic payload range checking",
          false,
          "TLS does not validate application data ranges."
        ],
        [
          "Automatic MQTT topic permissions",
          false,
          "ACLs and authorisation remain separate from transport encryption."
        ],
        [
          "Encryption of every stored database record",
          false,
          "TLS protects transit; stored data needs its own protection."
        ]
      ]
    },
    {
      "prompt": "A connection offers only obsolete TLS versions. Choose a policy.",
      "options": [
        [
          "Require supported TLS 1.2 or 1.3 settings",
          true,
          "Modern supported configurations avoid known weaknesses in obsolete protocols."
        ],
        [
          "Enable every obsolete protocol",
          false,
          "Legacy protocol support can expose known weaknesses."
        ],
        [
          "Use plain MQTT instead",
          false,
          "Removing TLS exposes the whole transport."
        ],
        [
          "Hide the port number",
          false,
          "An obscure port does not fix weak cryptography."
        ]
      ]
    },
    {
      "prompt": "A trusted sensor sends an unsafe command over TLS. Is it safe to execute?",
      "options": [
        [
          "No; validate and authorise the command",
          true,
          "Transport protection does not make an unsafe or unauthorised command acceptable."
        ],
        [
          "Yes; TLS validates all commands",
          false,
          "TLS does not understand the safety rules of your application."
        ],
        [
          "Yes; any encrypted data is harmless",
          false,
          "Malicious and invalid data can be encrypted too."
        ],
        [
          "Yes; JSON inside TLS is executable",
          false,
          "A data format and transport do not establish command safety."
        ]
      ]
    },
    {
      "prompt": "A TLS handshake fails because the Pi clock is wrong. Choose a fix.",
      "options": [
        [
          "Correct trusted time and retry verification",
          true,
          "Certificate validity depends on time; fix the clock rather than bypassing the check."
        ],
        [
          "Ignore every certificate date",
          false,
          "Ignoring dates also accepts certificates outside their valid lifetime."
        ],
        [
          "Disable TLS permanently",
          false,
          "A clock fault should not remove transport protection."
        ],
        [
          "Change to port 1883",
          false,
          "Changing to plain MQTT avoids the symptom by exposing traffic."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A sensor needs to publish but never subscribe. Choose its ACL.",
      "options": [
        [
          "Grant publish only on its telemetry topic",
          true,
          "Publish and subscribe are separate permissions and should match the device need."
        ],
        [
          "Grant read/write on all topics",
          false,
          "That gives far more access than required."
        ],
        [
          "Grant subscribe only",
          false,
          "That prevents the required publish operation and grants an unnecessary operation."
        ],
        [
          "Disable the ACL engine",
          false,
          "Without enforcement the resource permissions disappear."
        ]
      ]
    },
    {
      "prompt": "A developer asks for a temporary # subscription. Choose a review.",
      "options": [
        [
          "Use a narrow diagnostic topic and time limit",
          true,
          "A global subscription can expose data across devices and tenants."
        ],
        [
          "Grant # to all developers forever",
          false,
          "Permanent global access increases exposure across the system."
        ],
        [
          "Allow it because subscriptions are read-only",
          false,
          "Reading confidential messages is itself a sensitive capability."
        ],
        [
          "Trust the topic to stay secret",
          false,
          "Topic names are not an access-control boundary."
        ]
      ]
    },
    {
      "prompt": "Which ACL test gives useful evidence?",
      "options": [
        [
          "Test allowed actions and forbidden cross-device actions",
          true,
          "Negative tests verify that the ACL actually rejects access outside the intended scope."
        ],
        [
          "Only check that the broker starts",
          false,
          "Startup does not verify per-client resource permissions."
        ],
        [
          "Only test as an administrator",
          false,
          "An administrator does not exercise the restricted device policy."
        ],
        [
          "Only count lines in the ACL file",
          false,
          "Rule quantity does not show whether the policy is correct."
        ]
      ]
    },
    {
      "prompt": "A new device topic has no matching permission. What should happen?",
      "options": [
        [
          "Reject until an explicit rule is approved",
          true,
          "Default deny stops new resources from becoming accessible by accident."
        ],
        [
          "Copy the administrator ACL",
          false,
          "That grants unnecessary access and bypasses policy review."
        ],
        [
          "Allow because the topic is new",
          false,
          "New resources are not automatically trustworthy."
        ],
        [
          "Let any existing client subscribe",
          false,
          "Existing clients still need explicit permission for the new resource."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Where should production device secrets be kept?",
      "options": [
        [
          "In protected per-device storage, outside source code",
          true,
          "Restricting access and excluding secrets from repositories reduces accidental disclosure."
        ],
        [
          "In a public GitHub repository",
          false,
          "Public source makes the secret available to anyone."
        ],
        [
          "Inside MQTT topic names",
          false,
          "Topic names are frequently exposed in logs and tooling."
        ],
        [
          "In a shared screenshot",
          false,
          "A screenshot is an uncontrolled copy of the secret."
        ]
      ]
    },
    {
      "prompt": "Choose a credential provisioning method for a new fleet.",
      "options": [
        [
          "Generate independent random credentials securely",
          true,
          "Independent high-entropy credentials make guessing and fleet-wide reuse harder."
        ],
        [
          "Use the device model number",
          false,
          "Model numbers are public and predictable."
        ],
        [
          "Use password plus the device number",
          false,
          "A predictable pattern lets an attacker derive other credentials."
        ],
        [
          "Use the same default until an incident",
          false,
          "Known defaults invite compromise before an incident is detected."
        ]
      ]
    },
    {
      "prompt": "Which password is appropriate for a human maintenance account?",
      "options": [
        [
          "A long unique password with MFA where supported",
          true,
          "Length, uniqueness and an additional factor improve resistance to common account attacks."
        ],
        [
          "The account name twice",
          false,
          "Repeating public information is easy to guess."
        ],
        [
          "The same password as personal email",
          false,
          "Reuse lets a breach of another service compromise this account."
        ],
        [
          "A short password changed every day",
          false,
          "Frequent changes do not compensate for easily guessed credentials."
        ]
      ]
    },
    {
      "prompt": "A sensor is retired. What happens to its credential?",
      "options": [
        [
          "Revoke it and remove active broker access",
          true,
          "Decommissioning must close the old identity so it cannot be reused later."
        ],
        [
          "Reuse it for the next device",
          false,
          "Reuse mixes identities and preserves the value of old leaked copies."
        ],
        [
          "Leave it active indefinitely",
          false,
          "An unused valid credential remains an avoidable entry point."
        ],
        [
          "Post it in the asset register",
          false,
          "An asset register should track status, not expose usable secrets."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Which certificate checks belong in broker verification?",
      "options": [
        [
          "Trust chain, hostname and validity period",
          true,
          "These checks establish whether the certificate is trusted, current and for the intended endpoint."
        ],
        [
          "Only that the file ends in .pem",
          false,
          "A filename extension provides no cryptographic trust."
        ],
        [
          "Only that some certificate exists",
          false,
          "Any attacker can generate a certificate."
        ],
        [
          "Only that its text looks official",
          false,
          "Appearance does not prove a certificate is valid or trusted."
        ]
      ]
    },
    {
      "prompt": "A root CA is being replaced. Choose a safe rollout.",
      "options": [
        [
          "Stage the new trust anchor, test, then retire the old one",
          true,
          "A planned trust transition avoids outages while removing obsolete trust at the end."
        ],
        [
          "Delete all trust anchors first",
          false,
          "Devices may become unable to establish any trusted connection."
        ],
        [
          "Trust every CA presented by clients",
          false,
          "An untrusted peer cannot choose what your device should trust."
        ],
        [
          "Disable verification during the whole rollout",
          false,
          "A verification bypass exposes clients during the transition."
        ]
      ]
    },
    {
      "prompt": "Where does a certificate private key belong?",
      "options": [
        [
          "Protected on the device or in secure key storage",
          true,
          "The private key must remain secret because possession allows impersonation."
        ],
        [
          "Bundled with the public certificate on GitHub",
          false,
          "The certificate may be public; the corresponding private key must not be."
        ],
        [
          "Inside the topic name",
          false,
          "Topic names are not confidential key storage."
        ],
        [
          "Shared in every support email",
          false,
          "Each uncontrolled copy increases the chance of key exposure."
        ]
      ]
    },
    {
      "prompt": "How do you know automated renewal is working?",
      "options": [
        [
          "Monitor expiry, renewal results and deployed certificates",
          true,
          "A successful renewal job is insufficient if the live service still serves the old certificate."
        ],
        [
          "Assume the scheduler always succeeds",
          false,
          "Jobs can fail or fail to install the renewed certificate."
        ],
        [
          "Only check after an outage",
          false,
          "That discovers renewal failures too late to prevent disruption."
        ],
        [
          "Set alerts to ignore expiry",
          false,
          "Ignoring expiry hides the operational risk."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A compromised camera scans the office subnet. What should stop it?",
      "options": [
        [
          "An enforced inter-segment deny policy",
          true,
          "A segment boundary needs routing or firewall enforcement to block lateral access."
        ],
        [
          "A different subnet label alone",
          false,
          "Address labels alone do not enforce isolation."
        ],
        [
          "A hidden Wi-Fi network name",
          false,
          "Hiding a name does not block routed access."
        ],
        [
          "Changing the camera wallpaper",
          false,
          "A cosmetic change creates no network boundary."
        ]
      ]
    },
    {
      "prompt": "Where should broker administration be reachable?",
      "options": [
        [
          "From a restricted management segment",
          true,
          "Separating administration reduces exposure to ordinary IoT and user devices."
        ],
        [
          "From every guest device",
          false,
          "Guest access expands the set of potential attackers."
        ],
        [
          "From every sensor on the LAN",
          false,
          "Sensors normally do not require broker administration access."
        ],
        [
          "From the whole internet without restrictions",
          false,
          "Unrestricted public management creates unnecessary exposure."
        ]
      ]
    },
    {
      "prompt": "How should you verify VLAN isolation?",
      "options": [
        [
          "Test permitted routes and blocked cross-VLAN paths",
          true,
          "Connectivity tests must show both required access and effective isolation."
        ],
        [
          "Only inspect the VLAN names",
          false,
          "Names do not prove that routing rules enforce separation."
        ],
        [
          "Only ping within the same VLAN",
          false,
          "That says nothing about cross-segment exposure."
        ],
        [
          "Assume a switch default is secure",
          false,
          "Default settings may not enforce the intended boundary."
        ]
      ]
    },
    {
      "prompt": "A sensor needs updates from an approved server. Choose a route.",
      "options": [
        [
          "Allow only the required update path through policy",
          true,
          "Segmentation can preserve necessary services with explicit controlled exceptions."
        ],
        [
          "Connect it to every segment",
          false,
          "Broad connectivity removes the containment benefit."
        ],
        [
          "Bridge the guest and management networks",
          false,
          "A bridge opens a path between networks with different trust levels."
        ],
        [
          "Disable every boundary permanently",
          false,
          "An update requirement does not justify removing all isolation."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A firewall change is ready. What should happen before rollout?",
      "options": [
        [
          "Test required traffic and denied traffic, with rollback",
          true,
          "Validation and rollback reduce both accidental outages and unintended exposure."
        ],
        [
          "Deploy without checking rule order",
          false,
          "Rule ordering can change the effective policy."
        ],
        [
          "Allow all first and forget to restore rules",
          false,
          "An allow-all rule can defeat every intended restriction."
        ],
        [
          "Only check that the file saves",
          false,
          "A saved configuration may still be incorrect or unapplied."
        ]
      ]
    },
    {
      "prompt": "A temporary vendor firewall exception has expired. What now?",
      "options": [
        [
          "Remove it and verify access is closed",
          true,
          "Time-limited exceptions need cleanup so temporary access does not become permanent."
        ],
        [
          "Keep it just in case",
          false,
          "Unneeded access increases exposure over time."
        ],
        [
          "Widen it to all sources",
          false,
          "A wider rule makes the stale exception more dangerous."
        ],
        [
          "Rename the rule to permanent",
          false,
          "Renaming does not justify the underlying access."
        ]
      ]
    },
    {
      "prompt": "Which traffic should a sensor normally accept from the internet?",
      "options": [
        [
          "Only explicitly justified inbound traffic, usually none",
          true,
          "Minimising inbound services reduces the exposed attack surface."
        ],
        [
          "Every port below 1024",
          false,
          "A port range does not define a justified service need."
        ],
        [
          "Every connection with a large packet",
          false,
          "Packet size is not a trust decision."
        ],
        [
          "Every connection at night",
          false,
          "Time of day alone does not make unsolicited inbound traffic safe."
        ]
      ]
    },
    {
      "prompt": "A firewall blocks MQTT after a rule change. Choose a fix.",
      "options": [
        [
          "Inspect logs and narrowly correct the required rule",
          true,
          "Diagnose the intended path instead of removing unrelated protection."
        ],
        [
          "Disable the firewall forever",
          false,
          "That restores traffic by exposing unnecessary paths."
        ],
        [
          "Open all inbound and outbound ports",
          false,
          "An overbroad fix defeats the policy."
        ],
        [
          "Publish the broker password online",
          false,
          "Leaking credentials cannot repair a routing or firewall rule."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "Two customers use the same broker. Choose a topic design.",
      "options": [
        [
          "Separate tenant namespaces with enforced ACLs",
          true,
          "Namespaces support clear ownership; broker ACLs must enforce tenant isolation."
        ],
        [
          "One shared customer/# write permission",
          false,
          "That permits cross-tenant access."
        ],
        [
          "Put customer passwords in the topic",
          false,
          "Topic names can leak secrets through logs and subscriptions."
        ],
        [
          "Rely on customers not guessing names",
          false,
          "Obscurity does not provide access control."
        ]
      ]
    },
    {
      "prompt": "Should a telemetry topic name contain a personal email address?",
      "options": [
        [
          "Avoid personal data; use a non-secret device identifier",
          true,
          "Topics can be logged and widely observed, so minimise personal and sensitive information."
        ],
        [
          "Yes, because all topic names are secret",
          false,
          "Topic names are often visible to brokers and monitoring tools."
        ],
        [
          "Yes, and include the password too",
          false,
          "Adding credentials increases the exposure."
        ],
        [
          "Only if the topic is very long",
          false,
          "Length does not make personal data confidential."
        ]
      ]
    },
    {
      "prompt": "A device reconnects and sees an old retained unlock command. What is safer?",
      "options": [
        [
          "Reject stale commands using freshness checks",
          true,
          "Actuator commands need explicit expiry or sequencing so reconnects do not replay unsafe actions."
        ],
        [
          "Execute every retained command immediately",
          false,
          "That may repeat an action that is no longer intended."
        ],
        [
          "Treat retained messages as newly authorised",
          false,
          "Retention does not refresh the authority or relevance of a command."
        ],
        [
          "Use the telemetry timestamp as a password",
          false,
          "A public timestamp is not an authentication secret."
        ]
      ]
    },
    {
      "prompt": "What is the role of a well-designed MQTT topic hierarchy?",
      "options": [
        [
          "Make ownership and purpose clear for narrow ACLs",
          true,
          "A hierarchy supports policy and operations, but the broker still needs to enforce permissions."
        ],
        [
          "Replace all broker authentication",
          false,
          "A topic name cannot prove the identity of a client."
        ],
        [
          "Encrypt every payload automatically",
          false,
          "Topic structure does not encrypt message contents."
        ],
        [
          "Guarantee every payload is valid",
          false,
          "Input validation remains necessary regardless of topic design."
        ]
      ]
    }
  ],
  [
    {
      "prompt": "A temperature reading is 999999 degrees. Choose handling.",
      "options": [
        [
          "Reject it against an explicit permitted range",
          true,
          "Range validation prevents nonsensical data from reaching control decisions."
        ],
        [
          "Accept because it is numeric",
          false,
          "A correct type does not guarantee a sensible or safe value."
        ],
        [
          "Execute it as a shell command",
          false,
          "Sensor data must never become arbitrary code."
        ],
        [
          "Silently disable the alarm",
          false,
          "That hides the validation fault and can undermine safety."
        ]
      ]
    },
    {
      "prompt": "A client sends a 50 MB JSON payload to a small Pi. What helps?",
      "options": [
        [
          "Enforce message size limits before expensive parsing",
          true,
          "Early limits protect memory and CPU before the payload consumes excessive resources."
        ],
        [
          "Parse first, then check the size",
          false,
          "The expensive allocation has already happened."
        ],
        [
          "Trust all authenticated clients to be small",
          false,
          "Compromised or faulty trusted clients can still exhaust resources."
        ],
        [
          "Remove every validation limit",
          false,
          "That increases the denial-of-service exposure."
        ]
      ]
    },
    {
      "prompt": "A command JSON includes an unexpected admin field. Choose a policy.",
      "options": [
        [
          "Reject unknown fields under a strict schema",
          true,
          "A strict schema stops unexpected data from silently changing application behaviour."
        ],
        [
          "Copy every field into server settings",
          false,
          "Blind field copying can overwrite sensitive configuration."
        ],
        [
          "Accept it because JSON parsed",
          false,
          "Syntactic validity does not imply the data follows the intended schema."
        ],
        [
          "Execute the field name",
          false,
          "Executing field names turns input into code."
        ]
      ]
    },
    {
      "prompt": "Where should untrusted payload validation happen?",
      "options": [
        [
          "At each trusted boundary before use",
          true,
          "Server-side validation remains necessary even if a client already checks its own input."
        ],
        [
          "Only in the dashboard browser",
          false,
          "An attacker can bypass the browser and send messages directly."
        ],
        [
          "Only in a user manual",
          false,
          "Documentation does not reject malformed messages."
        ],
        [
          "Only after the actuator has moved",
          false,
          "Validation must happen before an unsafe effect."
        ]
      ]
    }
  ]
];
  IOT_MISSIONS.forEach((mission, i) => mission.decisions.push(...extra[i]));
})();
