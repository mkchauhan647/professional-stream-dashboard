import { useState } from "react";
import { useStore } from "../store/store";
import type { Task } from "../types/types";

export default function TaskComponent({ task }:{task:Task}
   ) {


    const removeTask = useStore((state) => state.removeTask);
    const updateTask = useStore((state) => state.updateTask);

    const [modelOpen, setModelOpen] = useState(false);
    const [editTask, setEditTask] = useState<Task>({
        id: task.id,
        title: task.title,
        state: task.state,
    });

    console.log("editTask", editTask);

    const handleDeleteTask = () => {
        console.log("delete task", editTask);
        removeTask(task.id!);
        setModelOpen(false);
    }


    const handleEditTask = () => {


        console.log("edit task", editTask);
        updateTask({ ...editTask, id: task.id });
        setModelOpen(false);
    }

   return (
       <div className="flex justify-between gap-4">


           {

               !modelOpen ?
                   <>
                       <h2>{task.title}</h2>
                        <div className="flex gap-2">
                            <button className="bg-green-500 text-white px-2 py-1 rounded cursor-pointer"
                                onClick={() => setModelOpen(true)}
                            >Edit</button>
                            <button className="bg-red-500 text-white px-2 py-1 rounded cursor-pointer"
                                onClick={handleDeleteTask}
                            >Delete</button>
                        </div>
                    </>
                    :

                    (
                        <div className="flex flex-col gap-2">
                            <input type="text" placeholder="Enter new task" className="border border-gray-300 p-2 rounded"
                                value={editTask.title}
                                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                            />
                            <select className="border border-gray-300 p-2 rounded text-black"
                                value={editTask.state}
                                onChange={(e) => setEditTask({ ...editTask, state: e.target.value })}
                            >
                                <option value="PLANNED">PLANNED</option>
                                <option value="IN_PROGRESS">IN_PROGRESS</option>
                                <option value="DONE">DONE</option>
                            </select>
                            <button className="bg-blue-500 text-white px-2 py-1 rounded cursor-pointer"
                                onClick={handleEditTask}
                            >Edit Task</button>
                        </div>
                    )
            }


        </div>
    );
}