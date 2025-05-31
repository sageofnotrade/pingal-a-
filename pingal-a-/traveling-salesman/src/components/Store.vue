<div class="shop-building">
  <!-- Awning -->
  <div class="awning">
    <div class="stripe stripe1"></div>
    <div class="stripe stripe2"></div>
    <div class="stripe stripe3"></div>
    <div class="stripe stripe4"></div>
    <div class="stripe stripe5"></div>
  </div>
  <!-- Roof -->
  <div class="roof"></div>
  <!-- Main building -->
  <div class="building">
    <!-- Door -->
    <div class="door"></div>
    <!-- Windows -->
    <div class="window window-left"></div>
    <div class="window window-right"></div>
  </div>
  <!-- Sale sign -->
  <div class="sale-sign">SALE</div>
  <!-- Shop sign -->
  <div class="shop-sign">SHOP</div>
</div>

.store-building, .shop-building {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Awning */
.awning {
  width: 90%;
  height: 18%;
  display: flex;
  flex-direction: row;
  position: absolute;
  top: 0;
  left: 5%;
  z-index: 4;
}
.stripe {
  flex: 1;
  height: 100%;
}
.stripe1 { background: #e74c3c; }
.stripe2 { background: #fff; }
.stripe3 { background: #e74c3c; }
.stripe4 { background: #fff; }
.stripe5 { background: #e74c3c; }

/* Roof */
.roof {
  width: 90%;
  height: 18%;
  background-color: #f39c12;
  clip-path: polygon(0% 100%, 50% 0%, 100% 100%);
  z-index: 2;
  position: absolute;
  top: 16%;
  left: 5%;
}

/* Main building */
.building {
  width: 80%;
  height: 60%;
  background-color: #f7e7ce;
  position: absolute;
  top: 32%;
  left: 10%;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  z-index: 1;
}

/* Door */
.door {
  position: absolute;
  width: 28%;
  height: 48%;
  background-color: #8d5524;
  bottom: 6%;
  left: 36%;
  border-radius: 4px 4px 10px 10px;
  border: 2px solid #5c3310;
}

/* Windows */
.window {
  position: absolute;
  width: 18%;
  height: 22%;
  background-color: #5dade2;
  top: 18%;
  border-radius: 3px;
  border: 2px solid #2980b9;
}
.window-left {
  left: 10%;
}
.window-right {
  right: 10%;
}

/* Sale sign */
.sale-sign {
  position: absolute;
  top: 2%;
  left: 60%;
  font-size: 8px;
  font-weight: bold;
  color: #fff;
  background: #e74c3c;
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18);
  transform: rotate(-10deg);
  border: 1px solid #c0392b;
}

/* Shop sign */
.shop-sign {
  position: absolute;
  bottom: 6%;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: bold;
  color: #fff;
  background: #f39c12;
  padding: 2px 10px;
  border-radius: 8px;
  z-index: 5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.18);
  border: 1px solid #e67e22;
} 