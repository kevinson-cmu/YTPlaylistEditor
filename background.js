let user_signed_in = false;
const CLIENT_ID = encodeURIComponent("----------------");
const RESPONSE_TYPE = encodeURIComponent('token');
const REDIRECT_URI = encodeURIComponent('------------------');
const STATE = encodeURIComponent('-------');
const SCOPE = encodeURIComponent('https://www.googleapis.com/auth/youtube');
const PROMPT = encodeURIComponent('consent');
var access_token = "";

function create_oauth2_url(){
    let url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=${RESPONSE_TYPE}&redirect_uri=${REDIRECT_URI}&state=${STATE}&scope=${SCOPE}&prompt=${PROMPT}`;
    return url;
}
function is_user_signed_in(){
    return user_signed_in;
}
function signOut(){
    chrome.browserAction.setPopup({popup: './popup.html'}, function(){
        user_signed_in = false;
        access_token = "";
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.message === 'login'){
        if(is_user_signed_in()){
            console.log("User is already signed in.");
        }else{
            chrome.identity.launchWebAuthFlow({
                url: create_oauth2_url(),
                interactive: true
            }, function (redirect_url){
                let token = redirect_url.substring(redirect_url.indexOf('access_token=') + 13);
                access_token = token.substring(0,token.indexOf('&'));
                chrome.browserAction.setPopup({popup: './popup-signed-in.html'}, function(){
                    user_signed_in = true;
                    sendResponse("success");
                });//consider adding auto Open
            });
            return true;
        }
    }else if(request.message === 'signOut'){
        signOut();
        sendResponse("success");
        return true;
    }else if(request.message === 'isUserSignedIn'){
        sendResponse(is_user_signed_in());
    }else if(request.message === 'userInfo'){
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://www.googleapis.com/youtube/v3/channels?alt=json&part=snippet&mine=true&access_token=' + access_token);
        httpRequest.onload = function(){
            if(httpRequest.status != 200){
                console.log("issue found!");
                signOut();
                sendResponse("signOut");
                return true;
            }
            console.log(JSON.parse(httpRequest.response));
            sendResponse(JSON.parse(httpRequest.response).items[0].snippet.title);
        };
        httpRequest.send();
        return true;
    }else if(request.message === 'check'){
        var httpRequest = new XMLHttpRequest();
        httpRequest.open('GET', 'https://www.googleapis.com/youtube/v3/playlists?alt=json&part=snippet&part=contentDetails&mine=true&maxResults=50&access_token=' + access_token);
        httpRequest.onload = function(){
            if(httpRequest.status==401){// figure out how to delete last error message?
                console.log("401 issue found!");
                logout();
                return;
            }
            sendResponse(JSON.parse(httpRequest.response));
        };
        httpRequest.send();
        return true;
    }else if(request.message === 'blockClicked'){
        var httpRequest = new XMLHttpRequest();
        var pID = request.options;
        console.log(pID);
        httpRequest.open('GET', 'https://www.googleapis.com/youtube/v3/playlistItems?alt=json&part=status&part=contentDetails&maxResults=50&playlistID=' + pID + '&access_token=' + access_token);
        httpRequest.onload = function(){
            if(httpRequest.status == 401){// figure out how to delete last error message?
                console.log("401 issue found!");
                logout();
                return;
            }else if(httpRequest.status == 404){
                console.log("playlist not found");
                return;
            }
            sendResponse(JSON.parse(httpRequest.response));
        };
        httpRequest.send();
        return true;
    }else if(request.message === 'vidClicked'){
        var httpRequest = new XMLHttpRequest();
        /*
        var pID = request.options;
        console.log(pID);
        httpRequest.open('GET', 'https://www.googleapis.com/youtube/v3/playlistItems?alt=json&part=status&part=contentDetails&maxResults=50&playlistID=' + pID + '&access_token=' + access_token);
        httpRequest.onload = function(){
            if(httpRequest.status == 401){// figure out how to delete last error message?
                console.log("401 issue found!");
                logout();
                return;
            }else if(httpRequest.status == 404){
                console.log("playlist not found");
                return;
            }
            sendResponse(JSON.parse(httpRequest.response));
        };
        httpRequest.send();*/
        return true;
    }
})