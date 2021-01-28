
class Polygon {
	constructor(verts) {
		this.verts = verts;
	}

	static getRegularPolygonVerts(n = 3, r = 1, rand = 0) {
		const verts = [];
		const a = 0;
		const TWO_PI = Math.PI * 2;
		for(let i = 0; i < n; i++) {
			// Thanks to https://youtu.be/H9CSWMxJx84?t=2729
			const vr = (rand) ? r + (Math.random() * rand) : r;
			verts.push([
				vr * Math.cos(a + i * TWO_PI / n), // x
				vr * Math.sin(a + i * TWO_PI / n), // y
				0
			]);
		}
		return verts;
	}

	/** Is an array of vertices inside this object's vertices? */
	// objectInside(obj) {
	// 	const { verts } = obj;
	// 	for(let i = 0; i < verts.length; i++) {
	// 		if (Polygon.pointInPolygon(verts[i], this.verts)) {
	// 			return true;
	// 		}
	// 	}
	// 	return false;
	// }

	static getCenter(verts) {
		const vl = verts.length;
		return verts.reduce((vertSum, bv) => {
			return [vertSum[0] + bv[0] / vl, vertSum[1] + bv[1] / vl];
		}, [0,0]);
	}

	static getRadius([ x, y ]) { // assumes a center point of 0,0
		return Math.sqrt(Math.pow(x, 2)	+ Math.pow(y, 2));
	}

	static getRadii(verts) {
		// Inner - smallest radius
		let inner = Infinity;
		// Outer/largest radius
		const outer = verts.reduce((n, bv) => {
			const d = Polygon.getRadius(bv);
			if (d < inner) { inner = d; }
			return (d > n) ? d : n;
		}, 0);
		return { inner, outer };
	}

	// From https://github.com/substack/point-in-polygon
	// ray-casting algorithm based on
	// http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

	// static pointInPolygon (point, vs) {
	// 	const x = point[0], y = point[1];
		
	// 	let inside = false;
	// 	for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
	// 		const xi = vs[i][0], yi = vs[i][1];
	// 		const xj = vs[j][0], yj = vs[j][1];
	// 		const intersect = ((yi > y) != (yj > y))
	// 			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	// 		if (intersect) inside = !inside;
	// 	}
	// 	return inside;
	// }

	// https://stackoverflow.com/a/12414951/1766230
	/**
	 * Helper function to determine whether there is an intersection between the two polygons described
	 * by the lists of vertices. Uses the Separating Axis Theorem
	 *
	 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
	 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
	 * @return true if there is any intersection between the 2 polygons, false otherwise
	 */
	/*
	static doPolygonsIntersect (a, b) {
		var polygons = [a, b];
		var minA, maxA, projected, i, i1, j, minB, maxB;

		for (i = 0; i < polygons.length; i++) {

			// for each polygon, look at each edge of the polygon, and determine if it separates
			// the two shapes
			var polygon = polygons[i];
			for (i1 = 0; i1 < polygon.length; i1++) {

				// grab 2 vertices to create an edge
				var i2 = (i1 + 1) % polygon.length;
				var p1 = polygon[i1];
				var p2 = polygon[i2];

				// find the line perpendicular to this edge
				var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

				minA = maxA = undefined;
				// for each vertex in the first shape, project it onto the line perpendicular to the edge
				// and keep track of the min and max of these values
				for (j = 0; j < a.length; j++) {
					projected = normal.x * a[j].x + normal.y * a[j].y;
					if (minA === undefined || projected < minA) {
						minA = projected;
					}
					if (maxA === undefined || projected > maxA) {
						maxA = projected;
					}
				}

				// for each vertex in the second shape, project it onto the line perpendicular to the edge
				// and keep track of the min and max of these values
				minB = maxB = undefined;
				for (j = 0; j < b.length; j++) {
					projected = normal.x * b[j].x + normal.y * b[j].y;
					if (isUndefined(minB) || projected < minB) {
						minB = projected;
					}
					if (isUndefined(maxB) || projected > maxB) {
						maxB = projected;
					}
				}

				// if there is no overlap between the projects, the edge we are looking at separates the two
				// polygons, and we know there is no overlap
				if (maxA < minB || maxB < minA) {
					return false;
				}
			}
		}
		return true;
	};
	*/
}

export default Polygon;
