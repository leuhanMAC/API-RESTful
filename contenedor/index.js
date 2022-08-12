const fs = require('fs');

class Contenedor {
    constructor(fileName){
        this.fileName = fileName;
        this.createIfNotExist();
    }
    
    async createIfNotExist(){
        try{
            await fs.promises.access(this.fileName)
        }catch(err){
            await fs.promises.writeFile(this.fileName, '[]', 'utf8');
        }
    }

    async getAll(){
        try {
            return JSON.parse(await fs.promises.readFile(this.fileName, 'utf8'));
        } catch (err) {
            if(err.message.includes('ENOENT')){
                await this.createIfNotExist();
                return this.save(content);
            } else {
                throw new Error(err);
            }
        }
    }

    async save(content){
        try {
            const data = await this.getAll();
            content.id = (data[data.length - 1]?.id || 0) + 1;
            data.push(content);
            await fs.promises.writeFile(this.fileName, JSON.stringify(data, null, 2), 'utf8');
        } catch (err) {
            if(err.message.includes('ENOENT')){
                await this.createIfNotExist();
                return this.save(content);
            } else {
                throw new Error(err)
            }
        }
    }

    async updateById(content){
        let wasFound = false;
        let product = content;

        try {

            const data = await this.getAll();

            const newData = data.map(item => {

                if(item.id === product.id){

                    wasFound = true;

                    product = {...item, ...product};
                    return product;
                }

                return item;
            });

            await fs.promises.writeFile(this.fileName, JSON.stringify(newData, null, 2), 'utf8');
            return wasFound ? product : null;

        } catch (err) {
            if(err.message.includes('ENOENT')){
                await this.createIfNotExist();
                return this.save(content);
            } else {
                throw new Error(err)
            }
        }
    }

    async getById(id){
        try {
            const data = await this.getAll();
            return data.find(item => item.id === id);
        } catch (error) {
            if(err.message.includes('ENOENT')){
                await this.createIfNotExist();
                return this.save(content);
            } else {
                throw new Error(err)
            }
        }
    }

    async deleteById(id){
        try {
            const data = await this.getAll();
            const newData = data.filter(item => item.id !== id);
            await fs.promises.writeFile(this.fileName, JSON.stringify(newData, null, 2), 'utf8');

            return data.find(item => item.id === id);

        } catch(error){
            if(err.message.includes('ENOENT')){
                await this.createIfNotExist();
                return this.save(content);
            } else {
                throw new Error(err)
            }
        }
    }

    async deleteAll(){
        try {
            await fs.promises.writeFile(this.fileName, '[]', 'utf8');
        } catch(error){
            if(err.message.includes('ENOENT')){
                await this.createIfNotExist();
                return this.save(content);
            } else {
                throw new Error(err)
            }
        }
    }
}

module.exports = Contenedor;