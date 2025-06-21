import { create } from "zustand"
import type { Task } from "../types/types";

import tasks from './tasks.json' assert { type: 'json' };

const store = (set:any) => ({
    tasks: tasks as Task[],
    states: ['PLANNED', 'IN_PROGRESS', 'DONE'],
    addTask: (task: Task) => set(((store: any) => {
        const newTask = {
            ...task,
            id: store.tasks.length + 1
        }

        // save to json file

        
        

        return {
            tasks: [...store.tasks, newTask]
        }
    })),
    removeTask: (id:number) => set((store: any) => ({
        tasks: store.tasks.filter((t: { id: number }) => t.id !== id)
    })),
    updateTask: (task: Task) => set((store: any) => ({

        

        tasks: store.tasks.map((t: { id: number, state: string, title: string }) => {

            console.log("t", t);
            console.log("task", task);

            if (t.id === task.id) {
                return { ...t, state: task.state, title: task.title }
            }
            return t;
        })
    }))
   ,

})

export const useStore = create(store);