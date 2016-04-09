module.exports = function(project) {
    var output = "";
    var indent = 0;
    function pad(indent) {
        return Array(indent + 1).join("    ");
    }

    function getPropertyType(type) {
        switch (type.toLowerCase()) {
            case "boolean":
            case "number":
            case "string":
                return type.toLowerCase();

            case "object": return "any";

            case "date": return "Date";

            case "buffer": return "Buffer";

            case "array": return "any[]";

            case "geopoint": return "{lat: number, lng: number}";
        }

        if (type.constructor === Array) {
            if (typeof type[0] === "string") {
                return getPropertyType(type[0]) + "[]";
            }

            if (type[0].type) {
                return getPropertyType(type[0]) + "[]";
            }

            return "any[]";
        }

        return type;
    }

    function generateInterface(item, index) {
        if (index > 0) {
            output += "\r\n\r\n";
        }
        output += pad(indent) + "interface " + item.name;
        if (item.extends) {
            output += " extends " + item.extends;
        }
        output += " {\r\n";
        ++indent;
        generateProperties(item);
        --indent;
        output += pad(indent) + "}";
    }

    function generateProperties(item) {
        item.properties.forEach(generateProperty, this);
    }

    function generateProperty(property) {
        output += pad(indent) + property.name;
        if (!property.required) {
            output += "?";
        }
        output += ": " + getPropertyType(property.type) + ";\r\n";
    }

    function generateRelationInterface() {
        output += pad(indent) + "interface Relation<T> {\r\n";
        indent++;
        output += pad(indent) + "(err: any, item: T): void;\r\n";
        output += pad(indent) + "build(data: T | any): void;\r\n";
        output += pad(indent) + "create(data: T | any, callback: (err: any, item: T) => void): void;\r\n";
        output += pad(indent) + "destroy(callback: (err: any) => void): void;\r\n";
        output += pad(indent) + "update(data: T | any, callback: (err: any, item: T) => void): void;\r\n";
        indent--;
        output += pad(indent) + "}\r\n\r\n";
    }

    if (project.emitRelation) {
        generateRelationInterface();
    }
    project.interfaces.forEach(generateInterface, this);

    return output;
}