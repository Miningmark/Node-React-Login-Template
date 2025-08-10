import User from "@/models/user.model.js";
import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model, NonAttribute } from "@sequelize/core";
import { Attribute, AutoIncrement, Default, NotNull, PrimaryKey, Table } from "@sequelize/core/decorators-legacy";

export enum BugReportStatusType {
    NEW = "new",
    CONFIRMED = "confirmed",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    CLOSED = "closed",
    REJECTED = "rejected"
}

@Table({
    tableName: "bug_reports",
    timestamps: false
})
class BugReport extends Model<InferAttributes<BugReport>, InferCreationAttributes<BugReport>> {
    @Attribute(DataTypes.INTEGER)
    @PrimaryKey
    @AutoIncrement
    @NotNull
    declare id: CreationOptional<number>;

    @Attribute(DataTypes.INTEGER)
    @NotNull
    declare userId: number;

    @Attribute(DataTypes.ENUM(...Object.values(BugReportStatusType)))
    @PrimaryKey
    @NotNull
    declare status: BugReportStatusType;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare name: string;

    @Attribute(DataTypes.TEXT)
    @NotNull
    declare description: string;

    @Attribute(DataTypes.JSON)
    @Default([])
    declare fileNames: CreationOptional<string[]>;

    @Attribute(DataTypes.DATE)
    @Default(DataTypes.NOW)
    @NotNull
    declare createdAt: CreationOptional<Date>;

    declare user?: NonAttribute<User>;

    declare getUser: BelongsToGetAssociationMixin<User>;
    declare setUser: BelongsToSetAssociationMixin<User, number>;
}

export default BugReport;
