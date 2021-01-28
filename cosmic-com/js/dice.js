window.dice = {
    roll1d : function (sides) {
		return (Math.floor(Math.random()*sides) + 1);
	}
	,roll_d : function (n, sides) {
		var t = 0;
		for (var i = 0; i < n; i++) {
			t += window.gameTools.roll1d(sides);
		}
		return t;
	}
};

