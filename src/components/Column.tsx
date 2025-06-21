import { useState } from "react";
import { useStore } from "../store/store";
import "./column.css";
import type { Task } from "../types/types";
import TaskComponent from "./Task";


export default function Column({ state }: {
    state: string;
}) {

    console.log("state", state);

    const tasks = useStore((state) => state.tasks);
    const filteredTasks = tasks.filter((task: Task) => task.state === state);

    const [modelOpen, setModelOpen] = useState(false);

    const [newTask, setNewTask] = useState<Task>({
        title: "",
        state: state,
    });


    console.log("filteredTasks", filteredTasks);
    console.log("state", state);
    console.log("tasks", tasks);


    const addTask = useStore((state) => state.addTask);

    const handleAddTask = () => {


    console.log("newTask", newTask);


      addTask(newTask);
        setNewTask({
            title: "",
            state: state,
      })
      setModelOpen(false);
    }


  return (
    <div className="flex flex-col bg-amber-500 p-4 rounded-lg shadow-md space-y-2 ">

          <div className="flex justify-between items- center w-full mb-4 gap-4">
              
            <h2 className="text-lg font-bold">{state}</h2>
              {
                  !modelOpen && (
                      <button className="bg-blue-500 text-white px-2 py-2 rounded cursor-pointer"
                onClick={() => {
                  setModelOpen(true);
                }}
              >Add Task</button>
                  )
              }
            </div>

          {filteredTasks.map((task: Task, index: number) => {
        return <TaskComponent key={index} task={task} />;
          })}
          

          {
                modelOpen && (
                <div className="flex flex-col gap-2">
                  <input type="text" placeholder="Task Title" className="border p-2 rounded" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
                  <button className="bg-blue-500 text-white px-2 py-2 rounded cursor-pointer"
                    onClick={handleAddTask}
                  >Add Task</button>
                </div>
              )
          }

    </div>
  );
}