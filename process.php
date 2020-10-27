<html>

<head>
    <title>Cinpout</title>
</head>

<body>
    <?php
    //initialize variables
    $s1 = $_POST["s1"];
    $s2 = $_POST["s2"];
    $d1 = $_POST["d1"];
    $d2 = $_POST["d2"];
    $input_matrix = $_POST["input_matrix"];
    $algo = $_POST["algo"];
    $input_file_name = "input.txt";

    //open input file and write data
    $myfile = fopen($input_file_name, "w");
    fwrite($myfile, $input_matrix);
    fclose($myfile);

    //open input and read data
    $myfile = fopen($input_file_name, "r");
    fread($myfile, filesize($input_file_name));
    fclose($myfile);

    //run shell command
    $command = escapeshellcmd($algo.".exe ".$s1." ".$s2." ".$d1." ".$d2." < ".$input_file_name);
    $output = shell_exec($command);

    //output
    echo str_replace("\n", "<br>", $output);
    ?>
</body>

</html>