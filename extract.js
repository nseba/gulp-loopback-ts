module.exports = function(models) {

    var project = {
        interfaces: [],
        idTypes: {},
        deferredResolutions: []
    }
    function createProperty(output, name, type, required) {
        output.properties.push({
            name: name,
            type: type,
            required: required
        });
    }

    function generateInterface(model) {
        var item = {
            name: model.name,
            extends: model.base,
            properties: []
        }

        generateInjectedId(item, model);
        generateProperties(item, model);
        generateRelations(item, model);
        
        project.interfaces.push(item);
    }

    function generateInjectedId(item, model) {
        if (!model.idInjection) return;
        createProperty(item, "id", "number", true);
        project.idTypes[model.name] = "number";
    }

    function generateProperties(item, model) {
        var properties = model.properties || {};

        for (var propertyName in properties) {
            var property = properties[propertyName];
            generateProperty(item, propertyName, property);
        }
    }

    function generateProperty(item, propertyName, property) {
        createProperty(item, propertyName, property.type, property.required || property.id);
        if (property.id) {
            project.idTypes[item.name] = property.type;
        }
    }

    

    function generateRelations(item, model) {

        var relations = model.relations || {};

        for (var relationName in relations) {
            if (relations.hasOwnProperty(relationName)) {
                var relation = relations[relationName];

                switch (relation.type) {
                    case "belongsTo":
                        generateBelongsTo(item, relation, true);
                        break;
                }
            }
        }
    }

    function generateBelongsTo(item, relation, deferUnresolved) {
        var idType = project.idTypes[relation.model];
        if (!idType) {
            if (deferUnresolved) {
                project.deferredResolutions.push({
                    item: item,
                    relation: relation
                });

                return;
            } else throw "Cannot resolve ID property on related entity " + relation.model;
        }

        createProperty(item, relation.foreignKey, project.idTypes[relation.model], true);
    }

    function resolveRelations() {
        project.deferredResolutions.forEach(function(dfd) {
            generateBelongsTo(dfd.item, dfd.relation, false);
        })
    }

    for (var modelName in models) {
        if (models.hasOwnProperty(modelName)) {
            var model = models[modelName];
            generateInterface(model);
        }
    }

    resolveRelations();

    return project;
}