import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { AbstractEntity } from '@/domain/entities/AbstractEntity';
import { Region } from '@/domain/entities/Region';
import { ClaimBuildType } from '@/domain/enums/ClaimBuildType';
import { Faction } from '@/domain/entities/Faction';
import { Coordinate } from '@/domain/entities/Coordinate';
import { Army } from '@/domain/entities/Army';
import { ProductionClaimbuild } from '@/domain/entities/ProductionClaimbuild';
import { SpecialBuilding } from '@/domain/enums/SpecialBuilding';
import { Player } from '@/domain/entities/Player';
import { ArmyType } from '@/domain/enums/ArmyType';

@Entity('claimbuilds')
export class ClaimBuild extends AbstractEntity {
    @Column({ unique: true })
    name: string;

    @ManyToOne(() => Region, { cascade: true })
    @JoinColumn({
        name: 'region',
        foreignKeyConstraintName: 'fk_claimbuild_region',
    })
    region: Region;

    @Column({ type: 'enum', enum: ClaimBuildType })
    type: ClaimBuildType;

    @ManyToOne(() => Faction, { cascade: true })
    @JoinColumn({
        name: 'owned_by',
        foreignKeyConstraintName: 'fk_claimbuild_owned_by',
    })
    ownedBy: Faction;

    @Column((type) => Coordinate)
    coordinates: Coordinate;

    @OneToMany(() => Army, (army) => army.stationedAt, { cascade: true })
    stationedArmies: Army[];

    @OneToMany(() => Army, (army) => army.originalClaimbuild, { cascade: true })
    createdArmies: Army[];

    @OneToMany(
        () => ProductionClaimbuild,
        (productionClaimbuild) => productionClaimbuild.claimbuild,
        { cascade: true },
    )
    productionSites: ProductionClaimbuild[];

    @Column('simple-array')
    specialBuildings: SpecialBuilding[];

    @Column({ nullable: true })
    traders: string;

    @Column({ nullable: true })
    siege: string;

    @Column({ nullable: true })
    numberOfHouses: string;

    @ManyToMany(() => Player, { cascade: true })
    @JoinTable({
        name: 'claimbuild_builders',
        joinColumns: [
            {
                name: 'claimbuild_id',
                foreignKeyConstraintName:
                    'fk_claimbuild_builders_claimbuild_id',
            },
        ],
        inverseJoinColumns: [
            {
                name: 'player_id',
                foreignKeyConstraintName: 'fk_claimbuild_builders_player_id',
            },
        ],
    })
    builtBy: Set<Player>;

    @Column({ default: 0 })
    freeArmiesRemaining: number;

    @Column({ default: 0 })
    freeTradingCompaniesRemaining: number;

    constructor(
        name: string,
        region: Region,
        type: ClaimBuildType,
        ownedBy: Faction,
        coordinates: Coordinate,
        specialBuildings: SpecialBuilding[],
        traders: string,
        siege: string,
        numberOfHouses: string,
        builtBy: Set<Player>,
    ) {
        super();
        this.name = name;
        this.region = region;
        this.type = type;
        this.ownedBy = ownedBy;
        this.coordinates = coordinates;
        this.productionSites = [];
        this.specialBuildings = specialBuildings;
        this.traders = traders;
        this.siege = siege;
        this.numberOfHouses = numberOfHouses;
        this.builtBy = builtBy;
        this.createdArmies = [];
        this.stationedArmies = [];
        this.freeArmiesRemaining = type.getFreeArmies();
        this.freeTradingCompaniesRemaining = type.getFreeTradingCompanies();
    }

    getCountOfArmies(): number {
        const count = this.createdArmies.filter(
            (army) => army.armyType === ArmyType.ARMY,
        ).length;
        console.debug(
            `Claimbuild [${this.name}] has created [${count}] armies`,
        );
        return count;
    }

    getCountOfTradingCompanies(): number {
        const count = this.createdArmies.filter(
            (army) => army.armyType === ArmyType.TRADING_COMPANY,
        ).length;
        console.debug(
            `Claimbuild [${this.name}] has created [${count}] trading companies`,
        );
        return count;
    }

    atMaxArmies(): boolean {
        const countOfArmies = this.getCountOfArmies();
        const maxArmies = this.type.getMaxArmies();
        if (countOfArmies >= maxArmies) {
            console.debug(
                `Claimbuild [${this.name}] is at max armies, max armies [${maxArmies}] - armies created [${countOfArmies}]`,
            );
            return true;
        }
        console.debug(
            `Claimbuild [${this.name}] can create more armies. max armies [${maxArmies}] - armies created [${countOfArmies}]`,
        );
        return false;
    }

    atMaxTradingCompanies(): boolean {
        const countOfTradingCompanies = this.getCountOfTradingCompanies();
        const maxTradingCompanies = this.type.getMaxTradingCompanies();
        if (countOfTradingCompanies >= maxTradingCompanies) {
            console.debug(
                `Claimbuild [${this.name}] is at max trading companies, max companies[${maxTradingCompanies}] - companies created [${countOfTradingCompanies}]`,
            );
            return true;
        }
        console.debug(
            `Claimbuild [${this.name}] can create more trading companies. max companies [${maxTradingCompanies}] - companies created [${countOfTradingCompanies}]`,
        );
        return false;
    }

    toString(): string {
        return this.name;
    }
}
