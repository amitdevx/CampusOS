import subprocess
import os

commits = [
    ("cca3b50", "feat(core): stabilize architecture and implement RBAC identity"),
    ("7cb4a83", "feat(ui): implement unified design system and academic core APIs"),
    ("9f9d72f", "feat(core): implement secure QR attendance engine and student dashboard"),
    ("ebc904a", "feat(core): implement user management and grading evaluations API"),
    ("95f09ec", "feat(realtime): implement live notifications and WebSocket infrastructure"),
    ("50cf801", "chore(db): generate and apply schema migration for academic and realtime models")
]

# We will just do a soft reset to HEAD~6, and then we have all changes staged.
# But wait, that squashes them! We want to keep them separate.
