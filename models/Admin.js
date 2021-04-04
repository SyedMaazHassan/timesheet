module.exports = (sequelize, Datatypes) => {
    const Admin = sequelize.define("Admin",{
        name:{
            type:Datatypes.STRING,
            allowNull: false
        },

        email:{
            type:Datatypes.STRING,
            allowNull: false
        },
        password:{
            type:Datatypes.STRING,
            allowNull: false
        },
        phone:{
            type: Datatypes.INTEGER,
            allowNull:false
        },
        role:{
            type: Datatypes.INTEGER,
            defaultValue:1
        }

    });


    return Admin
}