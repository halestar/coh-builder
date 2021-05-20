import enh_db from './EnhDB.json';

class EnhancementDB{
    
    path = "./EnhDB.json";
    db = enh_db;

    static type = 
    {
        regular: 1,
        invention: 2,
        hamidon: 3,
        sets: 4
    };

    static hamiTypes = 
    {
        hamidon: 1,
        hydra: 2,
        titan: 3,
    };

    regularEnh = [];
    invEnh = [];
    hamiEnh = {1: [], 2: [], 3: []};
    setEnh = [];


    constructor()
    {  
        for(var i = 0; i < this.db.Enhancements.length; i++)
        {
            switch(this.db.Enhancements[i].TypeID)
            {
                case EnhancementDB.type.regular: this.regularEnh.push(this.db.Enhancements[i]); break;
                case EnhancementDB.type.invention: this.invEnh.push(this.db.Enhancements[i]); break;
                case EnhancementDB.type.hamidon: 
                        if(!this.hamiEnh.hasOwnProperty(this.db.Enhancements[i].SubTypeID))
                            this.hamiEnh[this.db.Enhancements[i].SubTypeID] = [];
                        this.hamiEnh[this.db.Enhancements[i].SubTypeID].push(this.db.Enhancements[i]);
                        break;
                case EnhancementDB.type.sets: this.setEnh.push(this.db.Enhancements[i]); break;
            }
        }
    }

    getEnhacementType(type)
    {
        switch(type)
        {
            case EnhancementDB.type.regular: return this.regularEnh; break;
            case EnhancementDB.type.invention: return this.invEnh; break;
            case EnhancementDB.type.hamidon: return this.hamiEnh; break;
            case EnhancementDB.type.sets: return this.setEnh; break;
        }
    }
}

export default EnhancementDB;