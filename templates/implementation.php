<!DOCTYPE html>
<html lang="en">
<link rel="stylesheet" href="styling.css">
<head>
    <title>Implementation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/css/bootstrap.min.css" integrity="sha384-TX8t27EcRE3e/ihU7zmQxVncDAy5uIKz4rEkgIXeMed4M0jlfIDPvg6uqKI2xXr2" crossorigin="anonymous">
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ho+j7jyWK8fNQe+A12Hb8AhRq26LrZ/JpcUGGOn+Y7RsweNrtN/tE3MoK7ZeZDyx" crossorigin="anonymous"></script>
    <script src="https://kit.fontawesome.com/39c8bc8c71.js" crossorigin="anonymous"></script>
</head>
<body>
<div id="wrapper">
    <!-- Sidebar -->
    <div id="sidebar-wrapper">
        <ul class="sidebar-nav">
            <li><a href="home.html">Home</a></li>
            <li><a href="theory.html">Theoretical Background</a></li>
            <li><a href="working.html">Working</a></li>
            <li><a href="implementation.php">Implementation</a></li>
        </ul>
    </div>

    <!-- Page Content -->
    <div id="page-content-wrapper">
        <div class="container-fluid">
            <a href="#" class="btn" id="menu-toggle"><i class="fas fa-align-justify"></i></a>
            <div class="container jumbotron">
                <h2><b><u>IMPLEMENTATION OF SEARCH ALGORITHMS</u></b></h2>
            </div>

			<div class="container">
                <form action="process.php" method="post">
                    <div class="form-inline dropdown">
                        <h4><label for="algo">Select the search algorithm :</label></h4>
                        <select class="btn but dropdown" name="algo" id="algo" style="margin-bottom: 20px">
                            <option value="a_star">A Star</option>
                            <option value="ida_star">IDA Star</option>
                        </select>
                    </div>
                    <div class="form" style="display: flex">
                        <h4><label for="maze" >Enter the maze in form of 1's and 0's:</label></h4>
                        <textarea class="form-control" id="maze" name="input_matrix"
                                  style="background-color: azure; margin-bottom: 10px;margin-left: 10px" placeholder="--VALUE--"></textarea>
                    </div>
                    <div style="display: flex">
                        <div class="form-inline ">
                            <h4><label>Enter the Starting "x" value :</label></h4>
                            <div class="col-sm-2">
                                <label for="s1"></label><input type="text" id="s1" name="s1" class="form-control"
                                                               style="margin-bottom: 10px;margin-top:20px;background-color: azure"
                                                               placeholder="--VALUE--">
                            </div>
                        </div>
                        <div class="form-inline ">
                            <h4><label>Enter the Final "x" value :</label></h4>
                            <div class="col-sm-2">
                                <label for="d1"></label><input type="text" id="d1" name="d1" class="form-control"
                                                               style="margin-bottom: 10px;margin-top:20px;background-color: azure "
                                                               placeholder="--VALUE--">
                            </div>
                        </div>
                    </div>
                    <div style="display: flex">

                        <div class="form-inline ">
                            <h4><label>Enter the Starting "y" value :</label></h4>
                            <div class="col-sm-2">
                                <label for="s2"></label><input type="text" id="s2" name="s2" class="form-control"
                                                               style="margin-bottom: 10px;margin-top:20px;background-color: azure"
                                                               placeholder="--VALUE--">
                            </div>
                        </div>

                        <div class="form-inline ">
                            <h4><label>Enter the Final "y" value :</label></h4>
                            <div class="col-sm-2">
                                <label for="d2"></label><input type="text" id="d2" name="d2" class="form-control"
                                                               style="margin-bottom: 10px;margin-top:20px;background-color: azure "
                                                               placeholder="--VALUE--">
                            </div>
                        </div>
                    </div>
                    <div class="container" style="text-align: center;margin-top: 20px;margin-bottom: 20px">
                        <button  type="submit" class="btn but">Submit</button>
                    </div>
                </form>
        
        <?php
			$myfile = fopen("Output.txt", "r") or die("Unable to open file!");
			$filecontent = fread($myfile,filesize("Output.txt"));
            fclose($myfile);
            $visible = false;
            if($filecontent == "-"){
                $timeE = "";
                $comboE = "";
                $numstepsE = "";
                $totalE = "";
            }
            else{
                $list1 = explode("\n", $filecontent);
                $timeE = $list1[0];
                $comboE = $list1[1];
                $numstepsE = $list1[2];
                $totalE = $list1[3];
                $myfile = fopen("Output.txt", "w") or die("Unable to open file!");
                fwrite($myfile,"-");
                fclose($myfile);
                $visible = true;
            }
        ?>
        <?php
            if($visible){
                echo '
                <div class="form" style="display: flex">
                    <h4><label for="mazeop" >The combination of steps to reach the final position is:<span style="color:darkviolet;">'.$comboE.'</span></label></h4>
                </div>
                <div class="form" style="display: flex">
                    <h4><label for="searchop" >The number of steps to reach the final position is:<span style="color:darkviolet;">'.$numstepsE.'</span></label></h4>
                </div>
                <div class="form" style="display: flex">
                    <h4><label for="timeop" >The time required to find the path to reach the final position is:<span style="color:darkviolet;">'.$timeE.'</span></label></h4>
                </div>
                <div class="form" style="display: flex">
                    <h4><label for="travop" >The total number of steps in the traversal:<span style="color:darkviolet;">'.$totalE.'</span></label></h4>
                </div>
                ';
            }
        ?>
    </div>
</div>
<script type="text/javascript" src="jsfe.js"></script>
</body>
</html>
