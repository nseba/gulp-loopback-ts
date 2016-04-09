var _ = require("lodash");

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

    function getForeignKeyName(foreignKey, relationName) {
        if (foreignKey && foreignKey.length) return foreignKey;

        return _.camelCase(relationName) + "Id";
    }

    function extractInterface(model, prepend) {
        var item = {
            name: model.name,
            extends: model.base,
            properties: []
        }

        extractInjectedId(item, model);
        extractProperties(item, model);
        extractRelations(item, model);

        if (prepend) {
            project.interfaces.unshift(item);
        } else {
            project.interfaces.push(item);
        }
    }

    function extractInjectedId(item, model) {
        if (model.idInjection === false) return;
        createProperty(item, "id", "number", true);
        project.idTypes[model.name] = "number";
    }

    function extractProperties(item, model) {
        var properties = model.properties || {};

        for (var propertyName in properties) {
            var property = properties[propertyName];
            extractProperty(item, propertyName, property);
        }
    }

    function extractProperty(item, propertyName, property) {
        createProperty(item, propertyName, property.type, property.required || property.id);
        if (property.id) {
            project.idTypes[item.name] = property.type;
        }
    }

    function extractRelations(item, model) {

        var relations = model.relations || {};

        for (var relationName in relations) {
            if (relations.hasOwnProperty(relationName)) {
                var relation = relations[relationName];

                switch (relation.type) {
                    case "belongsTo":
                        extractBelongsTo(item, relationName, relation, true);
                        break;
                    case "hasOne":
                        extractHasOne(item, relationName, relation, model);
                }
            }
        }
    }

    function extractBelongsTo(item, relationName, relation, deferUnresolved) {
        var idType = project.idTypes[relation.model];

        var foreignKey = getForeignKeyName(relation.foreignKey, relationName);
        relation.foreignKey = foreignKey;

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

    function extractHasOne(item, relationName, relation, model) {
        createProperty(item, relationName, "Relation<" + relation.model + ">", true);        
        project.emitRelation = true;

        var foreignKey = getForeignKeyName(relation.foreignKey, relationName);
        var itemIdType = project.idTypes[item.name];

        var relatedItem = _.find(project.interfaces, function(ri) {
            return ri.name === relation.model;
        });

        if (relatedItem) {
            var relatedProperty = _.find(relatedItem.properties, function(prop) {
                return prop.name === foreignKey;
            });

            if (!relatedProperty) {
                createProperty(relatedItem, foreignKey, itemIdType, true);
            }
        } else {
            var relatedModel = _.find(models, function(rm) {
                return rm.name === relation.model;
            });

            if (relatedModel) {
                var hasProperty = false;
                for (var propName in relatedModel.properties) {
                    if (relatedModel.properties.hasOwnProperty(propName) && propName === foreignKey) {
                        hasProperty = true;
                        break;
                    }
                }

                if (!hasProperty) {
                    relatedModel.properties[foreignKey] = {
                        "type": itemIdType,
                        "required": true,
                    }
                }
            }
        }
    }


    function resolveRelations() {
        project.deferredResolutions.forEach(function(dfd) {
            extractBelongsTo(dfd.item, dfd.relation, false);
        })
    }

    for (var modelName in models) {
        if (models.hasOwnProperty(modelName)) {
            var model = models[modelName];
            extractInterface(model);
        }
    }

    resolveRelations();

    return project;
}