import { PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

export abstract class AbstractDomainEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @VersionColumn()
    version: number = 0;

    equals(other: AbstractDomainEntity): boolean {
        if (this === other) return true;
        if (!other || this.constructor !== other.constructor) return false;
        return this.id === other.id;
    }
}
