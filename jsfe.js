$(".dropContent0").click(function() {
    var x=$(this).text();
    $("#dropdownMenuButton0").text(x);
});

$(".dropContent0").click(function(){
    const { exec } = require("child_process");

    exec("g++ basic.cpp -o basic.exe", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
});
