/* Patch to return sorted polynomials: https://github.com/jiggzson/nerdamer/issues/502#issuecomment-553150965 */
let core = nerdamer.getCore();
core.Expression.prototype._toTeX = core.Expression.prototype.toTeX;
core.Expression.prototype.toTeX = function () {
    if (this.symbol.isComposite && this.symbol.isComposite()) {
        let symbols = this.symbol.collectSymbols(null, null, function (a, b) {
            if (a.group != b.group) {
                return a.group - b.group;
            }
            if (a.power != b.power) {
                return a.power - b.power;
            }

        }, true);
        let tex = [];
        for (let i = 0; i < symbols.length; i++) {
            tex.push(symbols[i].latex());
        }
        return tex.join('+').replace(/\+\-/g, '-'); //replace +- with -
    }
    //return the old toTeX
    return this._toTeX();
};

core.Expression.prototype.toStringViaLatex = function () {
    return nerdamer.toStringFromLaTeX(this.toTeX());
};

function interpolate(points, n) {
    if (n === undefined) {
        n = points.length;
    }

    let xVar = nerdamer('x');

    let variables = [];
    for (let i=0; i < n; ++i) {
        variables.push(nerdamer(`c_${i}`));
    }

    let func = nerdamer(0);
    for (let i=0; i < n; ++i) {
        let t = variables[i];
        if (i != 0) {
            t = t.multiply(xVar.pow(i));
        }
        func = func.add(t);
    }

    let equations = [];
    for (let [x, y] of points) {
        let lhs = func.sub(xVar, nerdamer(x));
        let rhs = nerdamer(y);
        equations.push(lhs + ' = ' + rhs);
    }

    let solution = nerdamer.solveEquations([...equations], variables);

    let poly = func;
    for (let [name, val] of solution) {
        poly = poly.sub(name, val);
    }

    return {
        'equations': equations,
        'solution': solution,
        'poly': poly,
    };
}

function playground_interpolate(e) {
    e.preventDefault();

    let points = [];
    for (let x = 1; x <= 4; ++x) {
        let y = e.target.querySelector(`input[name='y${x}']`).value;
        if (y === '' || y === null || y === undefined) {
            continue;
        }
        points.push([x, nerdamer(y)]);
    }
    let interpolated = interpolate(points);

    let out = e.target.querySelector("p[id='output']");
    out.textContent = '$$ f(x) = ' + interpolated.poly.toTeX() + '$$';
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, out]);

    let eqns = e.target.querySelector("p[id='equations']");
    eqns.textContent = '$$\\begin{cases}';
    for (let equation of interpolated.equations) {
        let eqn = nerdamer(equation).symbol;
        let coeffs = nerdamer.coeffs(eqn.LHS).symbol.elements;
        let row = [];
        for (let i=0; i < coeffs.length; ++i) {
            row.push(`${coeffs[i]}`);
        }
        eqns.textContent += row.join('&');
        eqns.textContent += '& ='
        eqns.textContent += nerdamer(eqn.RHS).toTeX();
        eqns.textContent += '\\\\';
    }
    eqns.textContent += '\\end{cases}$$';
    MathJax.Hub.Queue(["Typeset", MathJax.Hub, eqns]);
}