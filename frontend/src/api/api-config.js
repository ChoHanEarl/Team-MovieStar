let backendHost;
const hostname = window && window.location && window.location.hostname;

if(hostname === "localhost"){
    backendHost = "http://localhost:5000";
} else {
    backendHost = "http://api.todo-test-devseung.store";
}


export const API_BASE_URL = `${backendHost}`