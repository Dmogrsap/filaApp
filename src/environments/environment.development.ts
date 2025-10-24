export const environment = {
  // production: false,
  // baseUrl: "https://localhost:44360/api",
  // redirectUrl: "http://localhost:4200/",
  // errorMessage: "An unexpected error occurred.",

  firebase: {
    projectId: 'fila-app-fire',
    appId: '1:891103252191:web:a622d466ce7925ae95e36a',
    storageBucket: 'fila-app-fire.firebasestorage.app',
    apiKey: 'AIzaSyAm0NsPjOTyRpbBBEUvHevkDoj8K27klOQ',
    authDomain: 'fila-app-fire.firebaseapp.com',
    messagingSenderId: '891103252191',
  },

  production: false,
  supabaseUrl: 'https://jidbusphubjurkiuljvg.supabase.co',
  supabaseKey:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppZGJ1c3BodWJqdXJraXVsanZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTg2NjAsImV4cCI6MjA3NjE5NDY2MH0.z7N7ePslpAmVie87fgnYamDWsAKp1aGeJvDcRjU15Cs', // para operaciones desde servidor usar service role; para cliente usar anon
  supabaseBucket: 'images', // ajusta al nombre real del bucket
  supabaseTable: 'images', // ajusta al nombre real de la tabla
  /* Cambios para produccion, no se porque no agarra el de produccion */

  // production: true,
  // baseUrl: "http://ah969226/APIS/ITSoftwareControlAPI/api",
  // redirectUrl: "http://ah969226/ITSoftwareControl/",
  // errorMessage: "A base url occurred.",

  /*Cambios para _QA, no se porque no agarra el de produccion */

  // production: true,
  // baseUrl: "http://ah976093/APIS/ITSoftwareControlAPI/api",
  // redirectUrl: "http://ah976093/ITSoftwareControl/",
  // errorMessage: "A base url occurred.",

  //redirectUrl: "http://ah969226/HRInformationSystem/app",
};
