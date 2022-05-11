const tmi = require('tmi.js');
var fs =require('fs');
var date = new Date();
let foundName = false;
let foundingame = false;
class person{
    constructor(name,ingame,score,starthour,startminute,startsecond,maxstreak,streak,lstream){
        //constructor for the player with all the data
        this.Name = name
        this.ingame = ingame,
        this.Score = score,
        this.Starthour = starthour,
        this.Startminute = startminute,
        this.Startsecond = startsecond,
        this.Maxstreak = maxstreak,
        this.Streak = streak,
        this.LStream = lstream
    }
}
const client = new tmi.client({
    option:{ debug: true},
    connection:{
        secure: true,
        reconnect: true
    },
    identity:{
        username:'BOTNAME',
        password: 'oauth:PASSWORD'
    },
    channels:['FunkyNStu']
})
client.connect(start());
client.on('message', (channel,context,message,self) => {
    if(context["custom-reward-id"] === "CUSTOM REDEEM CODE HERE"){        
        //custom redeem in twitch to get in game
        var Name = context["display-name"];
        searchNameFile(Name);
        switch(foundName){
            case true:
                searchGame(Name);
                switch(foundingame){
                    //check if you're name is in the name.json file
                    case true:                        
                        client.say(channel,"you're already in the luigi game and just wasted your points Sadge");
                        break;
                    case false:
                        //adds u to the name.json file 
                        client.say(channel,'Adding '+ context["display-name"] +' in the list');
                        console.log('Added '+ context["display-name"] +' in the list');
                        addPlayer(Name);
                        break;
                }                
                break;
            case false:
                //adds u to the game + adds time
                const data = fs.readFileSync('Name.json','utf8');
                var nameJSON = JSON.parse(data);
                date = new Date();
                nameJSON.push(new person(context["display-name"],true,0,date.getHours(),date.getMinutes(),date.getSeconds(),0,0,false));
                client.say(channel,'new player enters the game! Adding '+ context["display-name"] +' in the list');
                console.log('Added '+ context["display-name"] +' in the list');
                fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
                break;
        }
    }else if(context["custom-reward-id"] === "CUSTOM REDEEM CODE HERE"){
        //custom redeem to kill someone in the game
        const data = fs.readFileSync('Name.json','utf8');
        var nameJSON = JSON.parse(data);
        for(let i = 0;i < nameJSON.length;i++){
            if(message === nameJSON[i].Name){
                nameJSON[i].ingame = false;
                //gets starttime from array
                let startHour = nameJSON[i].Starthour
                let startMinute = nameJSON[i].Startminute
                let startSecond = nameJSON[i].Startsecond
                //checks endtime when the command is called
                date = new Date();
                let endHour = date.getHours();
                let endMinute = date.getMinutes();
                let endSecond = date.getSeconds();
                let hour = endHour - startHour;
                let minute = endMinute - startMinute;
                let second = endSecond - startSecond;
                //calculate difference between them
                if(second < 0){
                    minute--;
                    second = 60 + second;
                }if(minute < 0){
                    hour--;
                    minute = 60 + minute;
                }
                // rounds number to a integer
                let SectoMin = Math.floor(second / 60);
                let eindres = minute + SectoMin;
                console.log(hour,minute,second,eindres);
                nameJSON[i].Score = nameJSON[i].Score + eindres;
                client.say(channel,message + ' your luigi has been killed by '+ context["display-name"]+', u had '+nameJSON[i].Score+' points');
                fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
            }
        }
    } else if(context["custom-reward-id"] === "CUSTOM REDEEM CODE HERE"){
        //streak for first
        const data = fs.readFileSync('Name.json','utf8');
        var nameJSON = JSON.parse(data);
        var Name = context["display-name"];
        searchNameFile(Name);
        switch(foundName){
            case true:                
                for(let i =0;i<nameJSON.length;i++){
                    if(nameJSON[i].Name === Name && nameJSON[i].LStream === true){
                        nameJSON[i].Streak+=1;
                        fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
                        client.say(channel,nameJSON[i].Name +" his streak is "+ nameJSON[i].Streak);
                        break;
                    } else if(nameJSON[i].Name === Name && nameJSON[i].LStream === false){
                        nameJSON[i].Streak+=1;
                        for(let j =0;j<nameJSON.length;j++){
                            if(nameJSON[j].LStream === true){
                                nameJSON[j].LStream = false;
                                if(nameJSON[j].Streak > nameJSON[j].Maxstreak){
                                    nameJSON[j].Maxstreak = nameJSON[j].Streak;                                    
                                }
                                client.say(channel,nameJSON[i].Name+ " ended the streak of "+ nameJSON[j].Name + ", he had "+ nameJSON[j].Streak + " points!");
                                nameJSON[j].Streak = 0;
                                
                            }
                        }
                        nameJSON[i].LStream = true;
                        fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
                        break;
                    }
                }
                break;
            case false:
                for(let j =0;j<nameJSON.length;j++){
                    if(nameJSON[j].LStream === true){
                        nameJSON[j].LStream = false;
                        if(nameJSON[j].Streak > nameJSON[j].Maxstreak){
                            nameJSON[j].Maxstreak = nameJSON[j].Streak;                            
                        }
                        client.say(channel,Name+ " ended the streak of "+ nameJSON[j].Name + ", he had "+ nameJSON[j].Streak + " points!");
                        nameJSON[j].Streak = 0;
                        
                    }
                }
                date = new Date();
                nameJSON.push(new person(context["display-name"],false,0,date.getHours(),date.getMinutes(),date.getSeconds(),0,1,true));
                fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
                break;
        }
    }
    if(self) return;    
    if(message.toLocaleLowerCase() === '!luigi'){
        let Names = "";
        fs.readFile("Name.json",'utf8',(err,data) =>{
            var nameJSON = JSON.parse(data);
            for(let i = 0;i< nameJSON.length;i++){
                if(nameJSON[i].ingame == true){
                    Names+= nameJSON[i].Name+", ";
                }
            }            
            client.say(channel,Names);
        });
        
    }
    if(message.toLocaleLowerCase() === '!score'){
        const data = fs.readFileSync('Name.json','utf8');
        var nameJSON = JSON.parse(data);
        for(let i = 0;i < nameJSON.length;i++){
            if(context["display-name"] === nameJSON[i].Name){
                //startTime
                let startHour = nameJSON[i].Starthour
                let startMinute = nameJSON[i].Startminute
                let startSecond = nameJSON[i].Startsecond
                //eindtime
                date = new Date();
                let endHour = date.getHours();
                let endMinute = date.getMinutes();
                let endSecond = date.getSeconds();
                let hour = endHour - startHour;
                let minute = endMinute - startMinute;
                let second = endSecond - startSecond;
                //calculate difference
                if(second < 0){
                    minute--;
                    second = 60 + second;
                }if(minute < 0){
                    hour--;
                    minute = 60 + minute;
                }
                let SectoMin = Math.floor(second / 60);
                let eindres = nameJSON[i].Score + minute + SectoMin;
                client.say(channel,'you have '+ eindres + ' points');
                break;
            }
        }
    }
    if(message.toLocaleLowerCase() === 'fuck u bot'){
        client.say(channel,"no fuck u")
    }
    if(message.toLocaleLowerCase() === 'stupid bot'){
        client.say(channel,"Better watch your mouth buddy, or I'll stomp your kneecaps backwards")
    }
	 if(message.toLocaleLowerCase() === "But I don't have knees"){
        client.say(channel,"Well, that's unfortunate")
    }
	 if(message.toLocaleLowerCase() === 'hype'){
        client.say(channel,"POGSLIDE")
    }
    if(message.toLocaleLowerCase() === "hi in chat"){
        client.say(channel,"wow, really clever");
    } 
    if(message.toLocaleLowerCase() === "!scLuigi"){
        console.log('Scoreboard luigi');
        const data = fs.readFileSync('Name.json','utf8');
        var nameJSON = JSON.parse(data);
        var sortedNames = "";
        nameJSON.sort(function (a,b){
            return b.Score - a.Score;
        })
        for(let i =0;i<nameJSON.length;i++){
            sortedNames += i+1+': '+nameJSON[i].Name+': '+ nameJSON[i].Score+",\n";
        }
        client.say(channel,sortedNames);    
    }
    if(message.toLocaleLowerCase() === "!scStreak"){
        console.log('Scoreboard streak');
        const data = fs.readFileSync('Name.json','utf8');
        var nameJSON = JSON.parse(data);
        var sortedNames = "";
        nameJSON.sort(function (a,b){
            return b.Maxstreak - a.Maxstreak;
        })
        for(let i =0;i<nameJSON.length;i++){
            sortedNames += i+1+': '+nameJSON[i].Name+': '+ nameJSON[i].Maxstreak+",\n";
        }
        client.say(channel,sortedNames);    
    }
    if(message.toLocaleLowerCase() === "!restart" && context.badges.hasOwnProperty('moderator')){
        //sets everyone score on 0 
        console.log('restarting luigi game');
        const data = fs.readFileSync('Name.json','utf8');
        var nameJSON = JSON.parse(data);
        for(let i = 0;i < nameJSON.length;i++){
            nameJSON[i].Score = 0;
            nameJSON[i].Streak = 0;
            nameJSON[i].maxstreak = 0;
        }
        client.say(channel,'Game has been reset');
        fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
    }
    if(message.toLocaleLowerCase() === '!help'){
        var help ="Have u tried scrolling down u numb nuts! KEKW";
        client.say(channel,help);
    }
});
function searchNameFile(name) {    
    const data = fs.readFileSync("Name.json",'utf8');
    var nameJSON = JSON.parse(data);
    for(let i = 0; i< nameJSON.length; i++) {
        if (name === nameJSON[i].Name){
            foundName = true;
            return;           
        } else if (name!= nameJSON[i].Name){
            foundName = false;
        }       
    } 
}    
function searchGame(name) {
    const data = fs.readFileSync('Name.json','utf8');
    var nameJSON = JSON.parse(data);
    for(let i = 0; i< nameJSON.length; i++) {
        if (name === nameJSON[i].ingame){
            if(nameJSON[i].ingame === true){
                foundingame = true;
                return;
            }           
        } else if (name != nameJSON[i].Name){
            foundingame = false;
        }       
    }
}
function addPlayer(name){
    const data = fs.readFileSync('Name.json','utf8');
    var nameJSON = JSON.parse(data);
    for(let i = 0; i< nameJSON.length; i++) {
        if (name === nameJSON[i].Name){
            nameJSON[i].ingame = true;
            //get time
            date = new Date();
            nameJSON[i].Starthour = date.getHours();
            nameJSON[i].Startminute = date.getMinutes();
            nameJSON[i].Startsecond = date.getSeconds();
            fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
            return;           
        }      
    }
}
function start(){
    const data = fs.readFileSync("Name.json",'utf8');
    var nameJSON = JSON.parse(data);
    for(let i = 0; i< nameJSON.length; i++) {
        if(nameJSON[i].ingame === true){
            nameJSON[i].ingame = false;

        }      
    }
    fs.writeFile('Name.json',JSON.stringify(nameJSON),function(err){});
}