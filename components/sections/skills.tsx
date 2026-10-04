import { PocketKnife } from "lucide-react";

import { resume } from "@/data/resume";

const Skills = () => {
  return (
    <section className="flex flex-col gap-4 rounded border border-zinc-600/60 bg-zinc-900/60 p-6">
      <div className="section-header flex items-center gap-4 text-2xl">
        <PocketKnife className="h-8 w-8 text-purple-600" />
        <h2 className="text-purple-600 uppercase">Skills</h2>
      </div>
      <div className="ml-2 grid grid-cols-3 gap-2">
        {resume.skills.map((skill) => {
          return (
            <div
              className="flex flex-col justify-center rounded border border-zinc-600/60 p-4"
              key={skill.label}
            >
              <div className="flex items-center gap-4">
                <span className="text-slate-300/60">{skill.percentage}%</span>
                <div className="h-2 w-full rounded-full bg-slate-300/60">
                  <div
                    className="h-full rounded-full bg-slate-300/80"
                    style={{ width: `${skill.percentage}%` }}
                  />
                </div>
              </div>
              <h3 className="text-purple-600 uppercase">{skill.label}</h3>
              <p className="text-justify text-slate-300/60">{skill.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Skills;
