/**
 * Denied base executables and utilities for Linux/Unix environments.
 * Matching against parsed binary names (e.g. from CommandParserService).
 */
export const LINUX_DENIED_COMMANDS: string[] = [
  // Disk / Hardware / Filesystem Manipulation
  "mkfs",
  "mkfs.ext4",
  "mkfs.ext3",
  "mkfs.xfs",
  "mkfs.btrfs",
  "mkfs.vfat",
  "mkfs.ntfs",
  "fdisk",
  "parted",
  "sfdisk",
  "gdisk",
  "wipefs",
  "shred",
  "dd",
  "mount",
  "umount",
  "chroot",

  // Privilege Escalation & Account Manipulation
  "sudo",
  "su",
  "doas",
  "pkexec",
  "passwd",
  "chpasswd",
  "useradd",
  "userdel",
  "usermod",
  "groupadd",
  "groupdel",
  "visudo",

  // Power & Init Lifecycle
  "shutdown",
  "reboot",
  "poweroff",
  "halt",
  "init",

  // Kernel & Modules
  "insmod",
  "rmmod",
  "modprobe",

  // Network & Firewall Disruption
  "iptables",
  "ip6tables",
  "nft",
  "ufw",

  // System State & Process Interruption
  "systemctl",
  "service",
  "killall",
  "pkill",

  // Reverse Shells & Raw Sockets
  "nc",
  "ncat",
  "socat",

  // Interactive Tools / Pagers / Multiplexers (hang stdin/TTY)
  "vim",
  "vi",
  "nano",
  "emacs",
  "ed",
  "less",
  "more",
  "man",
  "top",
  "htop",
  "btop",
  "nmon",
  "tmux",
  "screen",
  "byobu",
];

/**
 * Denied base executables and cmdlets for Windows (CMD & PowerShell).
 * Matching against parsed binary names (case-insensitive).
 */
export const WINDOWS_DENIED_COMMANDS: string[] = [
  // Disk, Volume & Partition Formatting
  "format",
  "diskpart",
  "Clear-Disk",
  "Initialize-Disk",
  "Remove-Partition",

  // Shadow Copies & Backup Tampering
  "vssadmin",
  "wbadmin",

  // System Power & State
  "shutdown",
  "Stop-Computer",
  "Restart-Computer",

  // User & Group Administration
  "New-LocalUser",
  "Remove-LocalUser",
  "Add-LocalGroupMember",

  // Services & Registry Manipulation
  "sc",
  "reg",
  "Stop-Service",
  "Suspend-Service",
  "Remove-Service",

  // Process Termination
  "taskkill",
  "Stop-Process",

  // Security & Boot Tampering
  "Set-MpPreference",
  "Add-MpPreference",
  "bcdedit",

  // Network Interface Manipulation
  "netsh",
  "Disable-NetAdapter",

  // Script & Binary Download / In-Memory Execution
  "certutil",
  "mshta",
  "bitsadmin",
  "Invoke-Expression",
  "IEX",

  // Interactive GUI / Utilities (hangs execution)
  "notepad",
  "notepad.exe",
];

export const DENIED_COMMANDS = new Set([
  ...LINUX_DENIED_COMMANDS,
  ...WINDOWS_DENIED_COMMANDS,
]);
