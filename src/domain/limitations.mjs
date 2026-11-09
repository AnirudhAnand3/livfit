export const LIMITATIONS = {
  knee: {
    excludeCategories: ["squat", "lunge"],
    note: "Knee limitation",
    mobility: {
      name: "Knee CARs + wall sit hold",
      desc: "Pain-free knee mobility and isometric strength without loaded flexion.",
    },
  },
  lower_back: {
    excludeCategories: ["hinge"],
    note: "Lower back limitation",
    mobility: {
      name: "Cat-cow + bird-dog",
      desc: "Spinal mobility and anti-rotation core control, no axial load.",
    },
  },
  shoulder: {
    excludeCategories: ["push_vertical", "pull_vertical"],
    note: "Shoulder limitation",
    mobility: {
      name: "Band shoulder CARs + scapular wall slides",
      desc: "Restores overhead range without loading the joint.",
    },
  },
  wrist: {
    excludeCategories: ["push_horizontal"],
    note: "Wrist limitation",
    mobility: {
      name: "Wrist flexor/extensor stretch + fist rotations",
      desc: "Reduces load-bearing wrist extension before pressing resumes.",
    },
  },
};

export function getExcludedCategories(limitations = []) {
  const set = new Set();
  limitations.forEach((l) => {
    const def = LIMITATIONS[l];
    if (def) def.excludeCategories.forEach((c) => set.add(c));
  });
  return set;
}
