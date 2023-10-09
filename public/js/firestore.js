import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";
import { collection, addDoc, doc, deleteDoc, onSnapshot, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

let firebaseConfig = {
    apiKey: "AIzaSyAZJuYw4XeaSTh4mJB-YnDci9whqK12tl8",
    authDomain: "kanbanboard-john.firebaseapp.com",
    projectId: "kanbanboard-john",
    storageBucket: "kanbanboard-john.appspot.com",
    messagingSenderId: "915177048419",
    appId: "1:915177048419:web:ecd3d1b98b34f4b3046b56",
    measurementId: "G-4K563XD5PX"
};

// Initialisieren Sie Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Definieren Sie Ihre Funktionen
window.saveTasksFB = async function () {
    const tasksCollection = collection(db, "tasks");
    arrTasks.forEach(async (task) => {
        const id = task.id.toString();
        const docRef = doc(tasksCollection, id);
        await setDoc(docRef, task);
        console.log("Task gespeichert mit ID: ", id);
    });
}

window.deleteTaskFB = async function (id) {
    // const idString = id.toString();
    const docRef = doc(db, "tasks", id.toString());
    await deleteDoc(docRef);
    console.log("Task gelöscht");
}

window.listenForChangesInFirestore = function () {
    const tasksCollection = collection(db, "tasks");
    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
        // Löschen Sie alle bestehenden Tasks aus dem Array
        window.arrTasks.length = 0;
        // Fügen Sie alle Tasks aus Firestore in das Array hinzu
        snapshot.forEach((doc) => {
            window.arrTasks.push(doc.data());
        });
        console.log("Tasks aus Firestore abgerufen und in arrTasks gespeichert");
        renderTasks();
    });
    return unsubscribe;
}

const unsubscribe = window.listenForChangesInFirestore();

self.addEventListener('update', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(names.map(function (name) {
                return caches.delete(name);
            }));
            console.log('werde ausgelöst', caches)
        })
    );
});
// window.getTasksFromFirestore().subscribe(tasks => {
//     console.log(tasks);
//     // arrTasks = tasks;
//     renderTasks();
// })