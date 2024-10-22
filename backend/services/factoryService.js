
export const factoryService = {
    
    find:(Model,query) => {
        return Model.find(query); 
    },

    create:(Model,data) => {
        return Model.create(data);
    },
    
    findById:(Model,id) => {
        return Model.findById(id);
    },

    updateById:(Model, id, updateData) => {
        return Model.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
    },

    deleteById: (Model, id) => {
        return Model.findByIdAndDelete(id);
    }


}