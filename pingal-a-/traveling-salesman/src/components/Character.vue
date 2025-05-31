    <div class="salesman-model">
      <!-- Hat -->
      <div class="hat">
        <div class="hat-top"></div>
        <div class="hat-brim"></div>
      </div>
      <!-- Head with mustache and glasses -->
      <div class="head">
        <div class="glasses left"></div>
        <div class="glasses right"></div>
        <div class="mustache"></div>
      </div>
      <!-- Body (suit) -->
      <div class="body">
        <div class="tie"></div>
      </div>
      <!-- Arms -->
      <div class="arm left-arm"></div>
      <div class="arm right-arm"></div>
      <!-- Legs -->
      <div class="leg left-leg"></div>
      <div class="leg right-leg"></div>
      <!-- Briefcase -->
      <div class="briefcase"></div>
    </div>

.salesman-model {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  perspective: 800px;
}

/* Hat */
.hat {
  position: absolute;
  width: 38%;
  height: 18%;
  top: 0%;
  left: 31%;
  z-index: 3;
}
.hat-top {
  width: 70%;
  height: 60%;
  background: #222e50;
  border-radius: 50% 50% 40% 40%/60% 60% 100% 100%;
  position: absolute;
  left: 15%;
  top: 0;
}
.hat-brim {
  width: 100%;
  height: 35%;
  background: #1a2233;
  border-radius: 50%;
  position: absolute;
  top: 60%;
  left: 0;
}

/* Head with mustache and glasses */
.head {
  position: absolute;
  width: 32%;
  height: 27%;
  background-color: #f5d0c4;
  border-radius: 50%;
  top: 10%;
  left: 34%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 2;
}
.glasses {
  position: absolute;
  width: 28%;
  height: 28%;
  border: 2px solid #333;
  border-radius: 50%;
  top: 35%;
  background: #fff8;
}
.glasses.left {
  left: 5%;
}
.glasses.right {
  right: 5%;
}
.mustache {
  position: absolute;
  width: 60%;
  height: 18%;
  background: #a0522d;
  border-radius: 0 0 60% 60%/0 0 100% 100%;
  bottom: 10%;
  left: 20%;
}

/* Body (suit) */
.body {
  position: absolute;
  width: 40%;
  height: 36%;
  background-color: #2c3e50;
  top: 34%;
  left: 30%;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 1;
}
.tie {
  position: absolute;
  width: 12%;
  height: 40%;
  background: #e74c3c;
  left: 44%;
  top: 20%;
  border-radius: 20% 20% 40% 40%/20% 20% 100% 100%;
}

/* Arms */
.arm {
  position: absolute;
  width: 15%;
  height: 38%;
  background-color: #2c3e50;
  top: 38%;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.left-arm {
  left: 10%;
}
.right-arm {
  right: 10%;
}

/* Legs */
.leg {
  position: absolute;
  width: 15%;
  height: 28%;
  background-color: #34495e;
  top: 70%;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.left-leg {
  left: 30%;
}
.right-leg {
  right: 30%;
}

/* Briefcase */
.briefcase {
  position: absolute;
  width: 18%;
  height: 18%;
  background: #8d5524;
  border-radius: 3px;
  bottom: 8%;
  left: 0%;
  border: 2px solid #5c3310;
  z-index: 2;
} 