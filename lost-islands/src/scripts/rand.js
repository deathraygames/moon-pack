function rand(n){ return Math.random() * (n || 1); };
function randInt(n){ return Math.floor(rand(n)) + 1; }
function randAround(n){
	var a = rand(n);
	var b = rand(n);
	return (a-b);
};