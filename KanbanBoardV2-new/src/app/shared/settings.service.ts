import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Firestore, collection, collectionData, doc, updateDoc, addDoc, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Staff } from '../types/Staff';
import { Task } from '../types/Task';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private columns: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(['TO DO', 'SCHEDULED', 'IN PROGRESS', 'DONE']);
  private categories: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(["App-Development", "Web-Development", "Bug-Web", "Bug-App", "Marketing", "Product", "Sale", "Management"]);
  private priorities: BehaviorSubject<object> = new BehaviorSubject<object>({
    'low': 'rgb(235, 211, 52)',
    'medium': 'rgb(235, 211, 52)',
    'important': 'rgb(55, 52, 235)',
    'high': 'rgb(235, 52, 52)'
  });
  private staffs: BehaviorSubject<Staff[]> = new BehaviorSubject<Staff[]>([
    {
      "name": "John",
      "img": "john.jpg"
    },
    {
      "name": "Sandra",
      "img": "logo_Sandra.png"
    }
  ]);

  constructor(private firestore: Firestore) { }

  getColumns(): Observable<string[]> {
    return this.columns.asObservable();
  }

  getCategories(): Observable<string[]> {
    return this.categories.asObservable();
  }

  getPrioritys(): Observable<object> {
    return this.priorities.asObservable();
  }

  getStaffs(): Observable<Staff[]> {
    return this.staffs.asObservable();
  }

  updateColumns(newColumns: string[]): void {
    this.columns.next(newColumns);
  }

  updateTaskColumn(taskId: string, newColumn: string): void {
    try {
      const tasksRef = collection(this.firestore, 'tasks');
      const documentRef = doc(tasksRef, taskId);
      updateDoc(documentRef, { status: newColumn });
    } catch (error) {
      console.error('Error updating task column:', error);
    }
  }

  updateTask(taskId: string, task: Task): void {
    try {
      const tasksRef = collection(this.firestore, 'tasks');
      const documentRef = doc(tasksRef, taskId);
      setDoc(documentRef, task);
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  }

  addToCollection(col: string, task: Task) {
    try {
      const colConnection = collection(this.firestore, col);
      addDoc(colConnection, task);
    } catch (error) {
      console.error('Add task ERROR: ', error);
    }
  }

  deleteFromCollection(col: string, id: string) {
    try {
      const colConnection = collection(this.firestore, col);
      const documentRef = doc(colConnection, id);
      deleteDoc(documentRef);
    } catch (error) {
      console.error('Delete task ERROR: ', error);
    }
  }

  getFromCollection(col: string) {
    const colConnection = collection(this.firestore, col);
    return collectionData(colConnection, { idField: 'id' }) as Observable<Task[]>;
  }


}
