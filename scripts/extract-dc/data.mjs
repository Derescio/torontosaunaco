// Data in a design page's script: every object/array literal made only of constant values (JSON or plain JS such as
// `{ sku: 'X', price: '$82.00' }`), named by where it sits: the variable or property it is assigned to, the method that
// returns it, or the function it is passed to. The script is parsed with acorn, never run. Literals that reference
// variables are page logic and are skipped, as are literals assigned to `this.x` (component state).

import { parse } from "acorn";

const NO_VALUE = Symbol("not a constant");

/** The constant value of an expression, or NO_VALUE when it depends on anything at run time. */
function constant(node) {
  switch (node?.type) {
    case "Literal":
      return node.regex ? NO_VALUE : node.value;
    case "TemplateLiteral":
      return node.expressions.length ? NO_VALUE : node.quasis.map((q) => q.value.cooked).join("");
    case "UnaryExpression": {
      if (node.operator !== "-" && node.operator !== "+") return NO_VALUE;
      const v = constant(node.argument);
      return typeof v === "number" ? (node.operator === "-" ? -v : v) : NO_VALUE;
    }
    case "ArrayExpression": {
      const out = [];
      for (const el of node.elements) {
        const v = el && el.type !== "SpreadElement" ? constant(el) : NO_VALUE;
        if (v === NO_VALUE) return NO_VALUE;
        out.push(v);
      }
      return out;
    }
    case "ObjectExpression": {
      const out = {};
      for (const p of node.properties) {
        if (p.type !== "Property" || p.kind !== "init" || p.method) return NO_VALUE;
        const key = p.computed ? constant(p.key) : p.key.type === "Identifier" ? p.key.name : p.key.value;
        const v = constant(p.value);
        if (key === NO_VALUE || v === NO_VALUE) return NO_VALUE;
        out[key] = v;
      }
      return out;
    }
    default:
      return NO_VALUE;
  }
}

const isCollection = (n) => n?.type === "ArrayExpression" || n?.type === "ObjectExpression";
const isEmpty = (v) => (Array.isArray(v) ? v.length === 0 : Object.keys(v).length === 0);
const keyName = (k) => (k.type === "Identifier" ? k.name : typeof k.value === "string" ? k.value : null);

export function extractData(scriptText, warn = () => {}) {
  let ast;
  try {
    ast = parse(scriptText, { ecmaVersion: "latest", sourceType: "script" });
  } catch (err) {
    warn(`script did not parse: ${err.message}`);
    return {};
  }

  const out = {};
  const record = (name, value) => {
    if (isEmpty(value)) return;
    const json = JSON.stringify(value);
    const same = (k) => k === name || (k.startsWith(`${name}_`) && /^\d+$/.test(k.slice(name.length + 1)));
    if (Object.entries(out).some(([k, v]) => same(k) && JSON.stringify(v) === json)) return;
    let key = name;
    for (let n = 2; key in out; n++) key = `${name}_${n}`;
    out[key] = value;
  };

  // `name` is what a constant literal found at `node` would be called; `method` names a method's return value.
  function walk(node, name, method) {
    if (!node || typeof node.type !== "string") return;
    if (isCollection(node) && name) {
      const value = constant(node);
      if (value !== NO_VALUE) return record(name, value);
    }
    switch (node.type) {
      case "VariableDeclarator":
        return walk(node.init, node.id.type === "Identifier" ? node.id.name : null, method);
      case "AssignmentExpression":
        walk(node.left, null, method);
        return walk(node.right, node.left.type === "Identifier" ? node.left.name : null, method);
      case "Property":
        if (node.computed) walk(node.key, null, method);
        return walk(node.value, keyName(node.key), method);
      case "MethodDefinition":
        return walk(node.value, null, keyName(node.key));
      case "ReturnStatement":
        return walk(node.argument, method, method);
      case "CallExpression":
        // `[…].concat(…)`: the literal heading a method chain carries the chain's name.
        walk(node.callee, name, method);
        // Option lists passed to a helper (`lfReasons: opt([...], x)`) are data; objects passed to calls are
        // options (setState, toLocaleString, fetch) and unnamed calls are actions, so neither is recorded.
        for (const arg of node.arguments) {
          if (arg.type === "ArrayExpression") walk(arg, name, method);
          else if (!(arg.type === "ObjectExpression" && constant(arg) !== NO_VALUE)) walk(arg, null, method);
        }
        return;
      case "MemberExpression":
        walk(node.object, name, method);
        if (node.computed) walk(node.property, null, method);
        return;
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "type" || key === "start" || key === "end") continue;
      if (Array.isArray(child)) child.forEach((c) => walk(c, null, method));
      else if (child && typeof child === "object") walk(child, null, method);
    }
  }

  walk(ast, null, null);
  return out;
}
