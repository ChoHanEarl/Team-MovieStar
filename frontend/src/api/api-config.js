let backendHost;
const hostname = window && window.location && window.location.hostname;

if(hostname === "localhost"){
    backendHost = "http://localhost:5000";
} else {
    backendHost = "http://Springboot-developer-env.eba-wnp7pacg.ap-southeast-2.elasticbeanstalk.com";
}


export const API_BASE_URL = `${backendHost}`