"use strict"
this.name        = "Breakable_WitchDrive"; 
this.author      = "capt murphy"; 
this.copyright   = "2011 capt murphy";
this.licence     = "CC BY-NC-SA 3.0"; // see http://creativecommons.org/licenses/by-nc-sa/3.0/ for more info.
this.description = "Script to simulate combat damage to the Witch Space Drive."; 
this.version     = "1.3.2";

// event handler driven function for functions at startup - awards equipment to existing ship if first run with OXP.
this.startUp = function()
{
   this.bwd_warning = new SoundSource;
   this.bwd_warning.sound = "warning.ogg";
   this.bwd_setmisjump = false;
   if (!missionVariables.bwd_status)
   {
      missionVariables.bwd_status = "OK";
   }
   this.bwd_status = missionVariables.bwd_status;
   if (!(Ship.shipDataForKey(player.ship.dataKey)["hyperspace_motor"] === "no") && player.ship.equipmentStatus("EQ_BREAKABLE_WITCHDRIVE") != "EQUIPMENT_OK" && this.bwd_status == "OK")
   {
      player.ship.awardEquipment("EQ_BREAKABLE_WITCHDRIVE");   
   }
      
}

// event handler driven function to fit equipment to newly purchased ship.
this.playerBoughtNewShip = function()
{
   if (!Ship.shipDataForKey(player.ship.dataKey)["hyperspace_motor"] === "no")
   {
      player.ship.awardEquipment("EQ_BREAKABLE_WITCHDRIVE");
   }
   this.bwd_status = "OK";
}

// event handler driven function to control actions if equipment damaged in combat.
this.equipmentDamaged = this.equipmentDestroyed = function(equipment)
{
   if (this.shipRestore && equipment === "EQ_BREAKABLE_WITCHDRIVE") {this.bwd_status = "DAMAGED"; return;}
   if (equipment == "EQ_BREAKABLE_WITCHDRIVE")
   {
      this.bwd_status = "DAMAGED";
      player.consoleMessage("Thruspace HyperDrive Damaged!",3);
      this.bwd_setupTimer();
      if (Math.random() < 0.34)
      {
         player.ship.fuelLeakRate = 0.25;
         player.consoleMessage("Quirium Fuel Leakage Detected!",3);
      }
   }
}

// event handler driven function for actions on save game.
this.playerWillSaveGame = function()
{
   missionVariables.bwd_status = this.bwd_status;
}
// event handler driven function to check if drive is damaged on start of witch space countdown.
this.playerStartedJumpCountdown = function(type)
{
   if (type == "standard" && this.bwd_status == "DAMAGED" && player.ship.equipmentStatus("EQ_BREAKABLE_WITCHDRIVE") != "EQUIPMENT_OK")
   {
      if (!this.bwd_consolemessageTimer)
         {
            this.bwd_consolemessageTimer = new Timer(this, this.bwd_consoleMessage, 1,1);
         }
      else
         {
            this.bwd_consolemessageTimer.start();
         }
      this.bwd_warning.play(3);
      if (Math.random() < 0.34)
      {
         system.addShips("bwd_dummy_entity", 1, player.ship.position);
      }
      if (Math.random() < 0.34)
      {
         if (player.ship.scriptedMisjump == false)
         {
         player.ship.scriptedMisjump = true;
         this.bwd_setmisjump = true;
         }
      }
   }
}
// called by timer during jump count down if drive is damaged.
this.bwd_consoleMessage = function()
{
      if (!player.ship.isValid || player.ship.docked){this.bwd_cancelconsolemessageTimer();return}
      player.consoleMessage("Warning - Thruspace HyperDrive is Damaged. Jump Outcome Unpredictable!",1);
}

// event handler driven function for actions on launching.
this.shipLaunchedFromStation = this.shipExitedWitchspace = function()
{
   if (player.ship.equipmentStatus("EQ_BREAKABLE_WITCHDRIVE") == "EQUIPMENT_OK" && this.bwd_status != "OK")
   {
      this.bwd_status = "OK";
      player.ship.fuelLeakRate = 0;
      player.ship.scriptedMisjump = false;
      this.bwd_deleteTimer();
      return;
   }
   if (this.bwd_status != "OK")
   {
      this.bwd_setupTimer();
      if (Math.random() < 0.34)
      {
         player.ship.fuelLeakRate = 0.25;
         player.consoleMessage("Quirium Fuel Leakage Detected!",3);
      }
   }
   this.bwd_reset();
}
// creates timers if not already in existance otherwise restarts existing timers.
this.bwd_setupTimer = function()
{
   if (!this.bwd_updateTimer)
      {
         this.bwd_updateTimer = new Timer(this, this.bwd_equipmentcheck, 0, 2);
      }
      else
      {
         this.bwd_updateTimer.start();
      }
}

this.bwd_deleteTimer = function()
{
   if (this.bwd_updateTimer && this.bwd_updateTimer.isRunning)
      {
         this.bwd_updateTimer.stop();
         delete this.bwd_updateTimer;
      }
}
 

// called by timer every 2 seconds when player is in flight to check if equipment repaired on fly.
this.bwd_equipmentcheck = function()
{   
   if (player.ship.equipmentStatus("EQ_BREAKABLE_WITCHDRIVE") == "EQUIPMENT_OK" && this.bwd_status != "OK") // check to see if something has repaired the witch drive on the fly e.g. Thargoid's Repair Bots OXP.
   {
      this.bwd_status = "OK";
      player.ship.fuelLeakRate = 0;
      this.bwd_deleteTimer();
      this.bwd_cancelconsolemessageTimer();
      this.bwd_reset();
   }
}
// removes scriptedMisjump flag and dummy entity if present.
this.bwd_reset = function ()
{
   if (this.bwd_setmisjump == true)
      {
         player.ship.scriptedMisjump = false;
         this.bwd_setmisjump = false;
      }
      function bwd_finddummy(entity)
   {
      return (entity.primaryRole == "bwd_dummy_entity");
   }
   var targets = system.filteredEntities(this, bwd_finddummy);
   if (targets.length > 0)
   {
      let counter = 0;
      for (counter = 0; counter < targets.length;counter++)
         {
            targets[counter].remove(true);
         }
   }
}
 

// event handler driven function to stop Timers on player's death or on docking.
this.shipDied = this.shipWillDockWithStation = function()
{
   this.bwd_deleteTimer();
}
// stops console message timer, and calls reset function.
this.playerCancelledJumpCountdown = this.playerJumpFailed = this.shipLaunchedEscapePod = function()
{
   this.bwd_cancelconsolemessageTimer();
   this.bwd_reset();
}

this.shipWillEnterWitchspace = this.bwd_cancelconsolemessageTimer = function()
{
   if (this.bwd_consolemessageTimer && this.bwd_consolemessageTimer.isRunning)
      {
         this.bwd_consolemessageTimer.stop();
         delete this.bwd_consolemessageTimer;
      }
}

this.allowAwardEquipment = function(eqKey, ship, context) {
   if (context === "purchase" && eqKey === "EQ_BREAKABLE_WITCHDRIVE" &&  Ship.shipDataForKey(player.ship.dataKey)["hyperspace_motor"] === "no") {
      return false;
   }
   else if (context === "purchase" && eqKey === "EQ_BREAKABLE_WITCHDRIVE") {
      if (player.ship.equipmentStatus("EQ_BREAKABLE_WITCHDRIVE") === "EQUIPMENT_DAMAGED") return true;
      else return false;
   }
return true;
}