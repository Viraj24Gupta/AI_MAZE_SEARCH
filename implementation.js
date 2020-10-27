var fs = require('fs');

var s1 = document.getElementById("s1");
var s2 = document.getElementById("s2");

var d1 = document.getElementById("d1");
var d2 = document.getElementById("d2");

var maze = document.getElementById("maze");

var algo = $("#dropContent0 :selected").text();

var input = "input.txt";

$input_file_name = "input.txt";

function writeToFile(item, name, time)
{
    alert("Hello " + item);
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var fh = fso.OpenTextFile("E:/labChart/etc/reserve.text", 8);
    fh.WriteLine(item);
    fh.Close();
}

function readFile()
{
    var fso = new ActiveXObject("Scripting.FileSystemObject");
    var fh = fso.OpenTextFile("input.text", 1, false, 0);
    var lines = "";
    while (!fh.AtEndOfStream) {
        lines += fh.ReadLine() + "\r";
    }
    fh.Close();
    return lines;
}

    const { exec } = require("child_process");
    exec("g++ ida ida_star.cpp", (error, data, getter) => {
        if(error){
            console.log("error",error.message);
            return;
        }
        if(getter){
            console.log("data",data);
            return;
        }
        console.log("data",data);
    });
    $myfile = fopen($input_file_name, "w");
    fwrite($myfile, $input_matrix);
    fclose($myfile);

    $myfile = fopen($input_file_name, "r");
    fread($myfile, filesize($input_file_name));
    fclose($myfile);

    $command = escapeshellcmd($algo.".exe ".$s1." ".$s2." ".$d1." ".$d2." < ".$input_file_name);
    $output = shell_exec($command);
    echo str_replace("\n", "<br>", $output);