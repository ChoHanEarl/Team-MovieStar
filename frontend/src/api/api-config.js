let backendHost;
const hostname = window && window.location && window.location.hostname;

if(hostname === "localhost"){
    backendHost = "http://localhost:5000";
} else {
    backendHost = "http://springboot-moviestar-env.eba-uge2hqnr.ap-northeast-2.elasticbeanstalk.com";
}


export const API_BASE_URL = `${backendHost}`