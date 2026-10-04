import { socialMedia } from "@/data/social";

export const PROJECT_REPOSITORY_SETTINGS = {
  featuredRepositoryName: socialMedia.github.domain,
  featuredSelectionCount: 2,
  excludedFromProjectList: [
    "ajaysinghnp",
    "iptv-channels",
    "adlist",
    "zigbee-network",
    "ha-sapi",
    "brands",
    "countrydetails",
    "Artificial-Intelligence",
    "PHP",
    "notes",
    "sankatmochan",
  ] as readonly string[],
} as const;
