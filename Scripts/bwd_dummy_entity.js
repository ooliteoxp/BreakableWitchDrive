this.name        = "ecl_escape_pod_beacon"; 
this.author      = "capt murphy"; 
this.copyright   = "2011 capt murphy";
this.licence     = "CC BY-NC-SA 3.0"; // see http://creativecommons.org/licenses/by-nc-sa/3.0/ for more info.
this.description = "Shipscript for escape pod beacons."; 
this.version     = "1.1";

this.shipSpawned = function()
{
	var targets = system.shipsWithPrimaryRole("escape-capsule",this.ship,50);
	if (targets.length > 0)
	{
	this.ship.target = targets[0];
	this.ecl_beaconcontrolTimer = new Timer (this, this.ecl_beaconcontrol,0,0.25);
	}
	else
	{
	this.ship.remove();
	}
}

this.ecl_beaconcontrol = function()
{
    if (this.ship.target)
    {
      this.ship.position = this.ship.target.position.add(this.ship.target.vectorUp.multiply(50));
    }
}

this.shipTargetLost = function()
{
	this.ship.remove();
}

this.shipRemoved = this.entityDestroyed = function()
{
  if (this.ecl_beaconcontrolTimer && this.ecl_beaconcontrolTimer.isRunning)
  {
	this.ecl_beaconcontrolTimer.stop();
	delete this.ecl_beaconcontrolTimer;
  }
}

	
	