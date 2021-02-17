var blockCount = 0;
var vidCount = 0;
var countryList = [];
const fileBoi  = require('fs');
fileBoi.readFile("countries.txt");
console.log(fileBoi);
countryList.push("thing")

document.querySelector('#signOut').addEventListener('click',function(){
    chrome.runtime.sendMessage({message: 'signOut'}, function(response){
        if (response === 'success') {
            window.close();
        }
    });
});

chrome.runtime.sendMessage({message: 'userInfo'}, function(response){
    if(document.getElementById("iden") != null){
        if(response == "signOut"){
            window.close();
        }
        else{
            document.getElementById("iden").innerHTML = response;
        }
    }
});
document.querySelector('#info').addEventListener('click',function(){
    clearMain();
    document.getElementById("infoBlock").hidden = false;
});
document.querySelector('#check').addEventListener('click',function(){
    clearMain();
    document.getElementById("main").style.display = "flex";
    document.getElementById("infoBlock").hidden = true;
    chrome.runtime.sendMessage({message: 'check'}, function(response){
        for(var i = 0; i < response.items.length; i++){
            makeBlock(response.items[i].snippet.title, response.items[i].contentDetails.itemCount, 0, response.items[i].id);
        }
    });
});
document.getElementById("infoBlock").hidden = false;
document.getElementById("main").style.display = "none";

function clearMain(){
    var blocks = document.getElementsByClassName("cloneBlock");
    for (var i = 0; i < blocks.length; i++){
        blocks[i].remove();
    }
    blockCount = 0;
    var vids = document.getElementsByClassName("cloneVid");
    for (var i = 0; i < vids.length; i++){
        vids[i].remove();
    }
    vidCount = 0;
    document.getElementById("main").style.display = "none";
}

function makeBlock(name, numVid, numErr, playlistID){
    var template = document.querySelector('#templateBlock');
    var block = template.cloneNode(true);
    block.id = 'block' + blockCount;
    block.hidden = !block.hidden;
    block.classList.add("cloneBlock");
    block.children[0].innerHTML = name;//if you change the format, revisit this
    block.children[0].id = playlistID;
    block.children[1].children[0].innerHTML = numVid;
    block.children[1].children[1].innerHTML = numErr;
    blockCount++;
    block.addEventListener('click',function(){
        chrome.runtime.sendMessage({message: 'blockClicked', options: playlistID}, function(response){
            var request = response;
            for(var i = 0; i < request.items.length; i++){
                makeVid(request.items[i].snippet.title, request.items[i].contentDetails.itemCount, 0, request.items[i].id);
            }
        });
    });
    if(document.getElementById("block0") == null){
        template.after(block);
    }else{
        document.getElementById('block' + (blockCount-2)).after(block);
    }
}

function makeVid(name, avail, vidID){
    var template = document.querySelector('#templateVid');
    var vid = template.cloneNode(true);
    vid.id = 'vid' + vidCount;
    vidCount++;
    vid.hidden = !vid.hidden;
    vid.classList.add("cloneVid");
    vid.children[0].innerHTML = name;
    vid.children[1].innerHTML = vidID;

    vid.addEventListener('click',function(){
        chrome.runtime.sendMessage({message: 'vidClicked', options: vidID}, function(response){
            //start here
            console.log("vidClicked");
            /*
            var request = response;
            for(var i = 0; i < request.items.length; i++){
                makeVid(request.items[i].snippet.title, request.items[i].contentDetails.itemCount, 0, request.items[i].id);
            }*/
        });
    });

    if(avail){
        vid.classList.add()="avail";
    }else{
        vid.classList.add()="inval";
    }
    
    if(document.getElementById("vid0") == null){
        template.after(vid);
    }else{
        document.getElementById('vid' + (vidCount-2)).after(vid);
    }
}