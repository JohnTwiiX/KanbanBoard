import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { addDoc, collection, CollectionReference, deleteDoc, doc, getDoc, setDoc, updateDoc, Firestore, getDocs, QuerySnapshot, getFirestore, onSnapshot } from 'firebase/firestore'; // Entferne 'collectionData'
import { Task } from '../types/Task';
import { Observable, from } from 'rxjs'; // Verwende 'from' für Observable
import { Settings } from '../types/Settings';
import { UserObj } from '../types/User';
import { SubTasks } from '../types/SubTasks';
import { FirebaseStorage, getStorage } from 'firebase/storage'; // Entferne 'provideStorage'
import { FirebaseApp, initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  public firestore: Firestore;
  public storage: FirebaseStorage;



  private backlogCollection: CollectionReference<any> | null = null;
  private anonymousBacklogCollection: CollectionReference<any> | null = null;
  private boardCollection: CollectionReference<any> | null = null;
  private anonymousBoardCollection: CollectionReference<any> | null = null;
  private settingsCollection: CollectionReference<any> | null = null;
  private usersCollection: CollectionReference<any> | null = null;

  constructor(private authService: AuthService) {
    // Firebase App initialisieren
    this.app = initializeApp(firebaseConfig);
    // Firebase-Dienste bereitstellen
    this.firestore = getFirestore(this.app);
    this.storage = getStorage(this.app);


  }

  initCollection(col: string) {
    if (col === 'anonym') {
      this.anonymousBacklogCollection = collection(this.firestore, 'anonymousBacklog');
      this.anonymousBoardCollection = collection(this.firestore, 'anonymousBoard');
    } else if (col === 'user') {
      this.backlogCollection = collection(this.firestore, 'backlog');
      this.boardCollection = collection(this.firestore, 'tasks');
    } else if (col === 'settings') {
      this.settingsCollection = collection(this.firestore, 'settings');
    }
    this.usersCollection = collection(this.firestore, 'users')
  }

  updateTaskColumn(taskId: string, newColumn: string): void {
    try {
      const tasksRef = this.getCollection('tasks');
      if (tasksRef) {
        const documentRef = doc(tasksRef, taskId);
        updateDoc(documentRef, { status: newColumn });
      }
    } catch (error) {
      console.error('Error updating task column:', error);
    }
  }

  updateSubTask(taskId: string, subTask: SubTasks): void {
    try {
      const tasksRef = this.getCollection('tasks');
      if (tasksRef) {
        const documentRef = doc(tasksRef, taskId);

        // Fetch the document to get the current subtasks
        getDoc(documentRef).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            const taskData = docSnapshot.data();
            const updatedSubTasks = taskData.subTasks.map((task: any) => {
              if (task.title === subTask.title) {
                return { ...task, checked: subTask.checked };
              }
              return task;
            });
            // Update the document with the modified subTasks array
            updateDoc(documentRef, { subTasks: updatedSubTasks });
          }
        });
      }
    } catch (error) {
      console.error('Error updating subtask:', error);
    }
  }

  updateTask(taskId: string, task: Task): void {
    try {
      let tasksRef
      if (task.status === 'BACKLOG') {
        tasksRef = this.getCollection('backlog');
      } else {
        tasksRef = this.getCollection('tasks');
      }

      if (tasksRef) {
        const documentRef = doc(tasksRef, taskId);
        setDoc(documentRef, task);
      }
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  }

  addToCollection(col: string, task: Task) {
    try {
      const colConnection = this.getCollection(col);
      if (colConnection) {
        addDoc(colConnection, task);
      }
    } catch (error) {
      console.error('Add task ERROR: ', error);
    }
  }

  deleteFromCollection(col: string, id: string) {
    try {
      const colConnection = this.getCollection(col);
      if (colConnection) {
        const documentRef = doc(colConnection, id);
        deleteDoc(documentRef);
      }
    } catch (error) {
      console.error('Delete task ERROR: ', error);
    }
  }

  moveToDeleted(task: Task) {
    try {
      const col = collection(this.firestore, 'deleted');
      if (col) {
        addDoc(col, task);
      }
    } catch (error) {
      console.error('ERROR moving to deleted ', error);
    }


  }

  getCollection(col: string) {
    const user = this.authService.getUser();
    if (user && user.isAnonymous) {
      if (col === 'tasks') return this.anonymousBoardCollection;
      return this.anonymousBacklogCollection;
    } else {
      if (col === 'tasks') return this.boardCollection;
      return this.backlogCollection;
    }
  }

  getFromCollection(col: string): Observable<Task[] | null> {
    return new Observable(observer => {
      const colConnection = this.getCollection(col);

      if (!colConnection) {
        console.log(`No collection found for: ${col}`);
        observer.next(null); // Sende ein `null`, wenn die Sammlung nicht existiert
        return;
      }

      const unsubscribe = onSnapshot(colConnection, querySnapshot => {
        if (!querySnapshot.empty) {
          const tasks: Task[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Task[];
          observer.next(tasks);
        } else {
          console.log(`No documents found in collection: ${col}`);
          observer.next([]);
        }
      }, error => {
        observer.error(error);
      });

      // Rückgabe der unsubscribe-Funktion, um das Abonnement zu beenden
      return () => unsubscribe();
    });
  }

  getSettingsCollection(): Observable<any> {
    return new Observable(observer => {
      if (!this.settingsCollection) {
        console.log('No settings collection found!');
        observer.next(null);  // Sende ein `null`, wenn die Sammlung nicht existiert
        return;
      }

      const unsubscribe = onSnapshot(this.settingsCollection, querySnapshot => {
        if (!querySnapshot.empty) {
          // Annahme: Es gibt nur ein Dokument
          const docSnapshot = querySnapshot.docs[0];
          observer.next({ id: docSnapshot.id, ...docSnapshot.data() });
        } else {
          console.log('No documents found in settings collection!');
          observer.next(null);
        }
      }, error => {
        observer.error(error);
      });

      // Rückgabe der unsubscribe-Funktion, um das Abonnement zu beenden
      return () => unsubscribe();
    });
  }

  setDefaultSettings(settings: Settings) {
    try {
      const colConnection = this.settingsCollection;
      if (colConnection) {
        addDoc(colConnection, settings);
      }
    } catch (error) {
      console.error('Add task ERROR: ', error);
    }
  }

  updateSettings(id: string, settings: Settings): void {
    try {
      const ref = this.settingsCollection;
      if (ref) {
        const documentRef = doc(ref, id);
        setDoc(documentRef, settings);
      }
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  }

  async updateSettingsKey(
    id: string,
    key: 'categories' | 'projects',
    newValue: string,
    operation: 'add' | 'remove'
  ) {
    try {
      const ref = this.settingsCollection;
      if (ref) {
        const documentRef = doc(ref, id);

        // Fetch current data
        const docSnap = await getDoc(documentRef);
        if (docSnap.exists()) {
          const currentData = docSnap.data();

          if (key === 'categories' || key === 'projects') {
            const currentArray: string[] = currentData[key] || [];

            // Modify the array based on the operation
            let updatedArray: string[];
            if (operation === 'add') {
              const oldArray = currentArray.filter(item => item !== newValue)
              updatedArray = [...oldArray, newValue];
            } else if (operation === 'remove') {
              updatedArray = currentArray.filter(item => item !== newValue);
            } else {
              throw new Error('Invalid operation');
            }

            // Update the document
            await updateDoc(documentRef, { [key]: updatedArray });
            console.log(`Successfully updated ${key} for document ${id}.`);
          } else {
            throw new Error('Invalid key');
          }
        } else {
          throw new Error('Document does not exist');
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  }

  getUsers(): Observable<UserObj[] | null> {
    return new Observable(observer => {
      if (!this.usersCollection) {
        console.log('No settings collection found!');
        observer.next(null);  // Sende ein `null`, wenn die Sammlung nicht existiert
        return;
      }

      const unsubscribe = onSnapshot(this.usersCollection, querySnapshot => {
        const users: UserObj[] = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            display_name: data['display_name'],
            uid: data['uid'],
            image: data['image'], // Standardwerte setzen, falls Felder fehlen
          };
        });
        observer.next(users); // Rückgabe der UserObj-Daten bei jedem Update
      }, error => {
        observer.error(error); // Fehlerbehandlung
      });

      // Rückgabe der unsubscribe-Funktion, um das Abonnement zu beenden
      return () => unsubscribe();
    });
  }
}
