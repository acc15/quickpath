
export type PathPart = string | number;

export default class ObjPath {

    parts: PathPart[];

    constructor(parts: PathPart[]) {
        this.parts = parts;
    }

    get(obj: any): any {
        for (const part of this.parts) {
            if (obj === null || obj === undefined) {
                break;
            }
            obj = obj[part];
        }
        return obj;
    }

    set(obj: any, val: any): any {
        if (this.parts.length === 0) {
            return val;
        }

        if (obj === null || obj === undefined) {
            obj = ObjPath.createByPart(this.parts[0]);
        }

        const root = obj;
        for (let i = 0; i < this.parts.length - 1; i++) {
            const part = this.parts[i];
            if (obj[part] === null || obj[part] === undefined) {
                obj[part] = ObjPath.createByPart(this.parts[i + 1]);
            }
            obj = obj[part];
        }
        obj[this.parts[this.parts.length - 1]] = val;
        return root;
    }

    apply(obj: any, val: any): any {
        if (this.parts.length === 0) {
            return val;
        }

        const root = ObjPath.shallowCopyForPart(obj, this.parts[0]);

        // TODO implement
        // for (let i = 0; i < this.parts.length - 1; i++) {
        //     const part = this.parts[i];
        //     if (obj[part] === null || obj[part] === undefined) {
        //         obj[part] = ObjPath.createByPart(this.parts[i + 1]);
        //     }
        //     obj = obj[part];
        // }

        return root;
    }

    static empty(): ObjPath {
        return new ObjPath([]);
    }

    static parse(path: string): ObjPath {

        const parts: PathPart[] = [];

        let part: string | null = null;
        let index: boolean = false;
        for (const ch of path) {
            if (index ? ch === ']' : (ch === '[' || ch === '.')) {
                if (part !== null) {
                    parts.push(ObjPath.parsePart(part, index));
                }
                part = index ? null : "";
                index = !index && ch === '[';
                continue;
            }
            part = part === null ? ch : part + ch;
        }
        if (part !== null) {
            parts.push(ObjPath.parsePart(part, index));
        }
        return new ObjPath(parts);
    }

    static shallowCopyForPart(obj: any, part: PathPart): any[] | object {
        if (!obj) {
            return ObjPath.createByPart(part);
        }

        if (Array.isArray(obj)) {
            return obj.slice();
        }

        const result: any = {};
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                result[prop] = obj[prop];
            }
        }
        return result;
    }

    static createByPart(part: PathPart): any[] | object {
        return ObjPath.isIndex(part) ? [] : {};
    }

    static isIndex(part: PathPart): part is number {
        return typeof part === "number";
    }

    static parsePart(part: string, index: boolean): PathPart {
        if (!index) {
            return part;
        }
        if (part.indexOf('.') >= 0) {
            throw "array indexes must be integer";
        }
        if (part.indexOf('-') >= 0) {
            throw "array indexes must be positive";
        }
        if (!/^[0-9]+$/.test(part)) {
            throw "array indexes must be a number";
        }
        return Number(part);
    }

};
