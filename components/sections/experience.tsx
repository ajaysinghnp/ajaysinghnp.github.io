import { resume } from "@/data/resume";
import { BriefcaseBusiness } from "lucide-react";
import React from "react";
import PingingDot from "../pinging-dot";

const Experience = () => {
  return (
    <section className="flex flex-col gap-4 rounded border border-zinc-600/60 bg-zinc-900/60 p-6">
      <div className="section-header flex items-center gap-4 text-2xl">
        <BriefcaseBusiness className="h-8 w-8 text-purple-600" />
        <h2 className="uppercase">Work Experience</h2>
      </div>
      <ul className="ml-2 flex flex-col">
        {resume.workExperiences.map((work, index) => {
          return (
            <li className="relative flex items-center gap-8 py-4" key={index}>
              <div className="absolute left-[5px] h-full w-[2px] bg-slate-300/60"></div>
              <PingingDot />
              <div>
                <h3 className="text-purple-600 uppercase">
                  {work.title}{" "}
                  <span className="ml-4 text-slate-300/60 capitalize">{work.date}</span>
                </h3>
                <p>{work.company}</p>
                <p className="text-slate-300/60">{work.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Experience;
