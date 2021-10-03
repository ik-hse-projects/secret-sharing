module obj()
//sphere(d=20);
//cube([25,15,20], center=true);
rotate([0,60,30]) cylinder(h=20, d=20, center=true);

color("red") obj();

d = 10;

translate([0,0,15+d])
projection()
obj();

translate([-15-d,0,0])
rotate([0,90,0]) projection()
rotate([0,-90,0]) obj();

translate([0,-15-d,0])
rotate([90,0,0]) projection()
rotate([-90,0,0]) obj();

color("#00000070")
cube([30,30,30], center=true);
