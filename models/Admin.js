module.exports = (sequelize, Datatypes) => {
    const Admin = sequelize.define("Admin",{
        fname:{
            type:Datatypes.STRING,
            allowNull: false
        },
        lname:{
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
            allowNull:false       }

    });


    return Admin
}