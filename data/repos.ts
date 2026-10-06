import { socialMedia } from "@/data/social";

export const PROJECT_REPOSITORY_SETTINGS = {
  featuredRepositoryName: socialMedia.github.domain,
  featuredSelectionCount: 2,
  excludedFromProjectList: [
    "ajaysinghnp",
    "blog",
    "cheatsheets",
    "iptv-channels",
    "adlist",
    "zigbee-network",
    "ha-sapi",
    "brands",
    "countrydetails",
    "Artificial-Intelligence",
    "AutoReveal-Wifi-Password",
    "PHP",
    "notes",
    "sankatmochan",
    "ZiFi",
    "DSP_MATLAB-Programs",
    "Office-File-Password",
    "Learning-Rust",
  ] as readonly string[],
} as const;
