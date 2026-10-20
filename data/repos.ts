import { socialMedia } from "@/data/social";

export const PROJECT_REPOSITORY_SETTINGS = {
  featuredRepositoryName: socialMedia.github.domain,
  featuredSelectionCount: 2,
  page: {
    title: "Projects",
    description: "Project description to be written",
    eyebrow: "projects / open signal",
    heading: "Things I've made.",
    intro:
      "A changing index of open-source experiments, practical utilities, and tools built to make a real workflow a little better.",
  },
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
