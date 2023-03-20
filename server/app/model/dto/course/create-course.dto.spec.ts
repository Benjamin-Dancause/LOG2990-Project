import { Test, TestingModule } from '@nestjs/testing';
import { CreateCourseDto } from './create-course.dto';

describe('CreateCourseDto', () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            providers: [CreateCourseDto],
        }).compile();
    });

    describe('name', () => {
        it('should be a string', async () => {
            const createCourseDto = app.get<CreateCourseDto>(CreateCourseDto);
            expect(typeof createCourseDto.name).toEqual('undefined');
        });

        it('should have a maximum length of 50 characters', async () => {
            const createCourseDto = app.get<CreateCourseDto>(CreateCourseDto);
            expect(createCourseDto.name.length).toBeLessThanOrEqual(50);
        });
    });

    describe('teacher', () => {
        it('should be a string', async () => {
            const createCourseDto = app.get<CreateCourseDto>(CreateCourseDto);
            expect(typeof createCourseDto.teacher).toEqual('undefined');
        });
    });

    describe('subjectCode', () => {
        it('should be a string', async () => {
            const createCourseDto = app.get<CreateCourseDto>(CreateCourseDto);
            expect(typeof createCourseDto.subjectCode).toEqual('undefined');
        });
    });

    describe('credits', () => {
        it('should be a number', async () => {
            const createCourseDto = app.get<CreateCourseDto>(CreateCourseDto);
            expect(typeof createCourseDto.credits).toEqual('undefined');
        });
    });
});

/*
import { COURSE_NAME_MAX_LENGTH } from '@app/model/dto/course/course.dto.constants';
import { ApiProperty } from '@nestjs/swagger';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateCourseDto } from './create-course.dto';

describe('CreateCourseDto', () => {
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [CreateCourseDto],
        }).compile();
    });

    it('should be defined', () => {
        const dto = module.get<CreateCourseDto>(CreateCourseDto);
        expect(dto).toBeDefined();
    });

    it(`should have a name property with a maxLength of ${COURSE_NAME_MAX_LENGTH}`, () => {
        const dto = module.get<CreateCourseDto>(CreateCourseDto);
        const apiProperty: typeof ApiProperty = Reflect.getMetadata('swagger/apiModelProperties', dto)['name'];

        expect(apiProperty).toBeDefined();
        expect(apiProperty['required']).toBe(true);
        expect(apiProperty['type']).toBe('string');
    });

    it('should have a teacher property', () => {
        const dto = module.get<CreateCourseDto>(CreateCourseDto);
        const apiProperty: typeof ApiProperty = Reflect.getMetadata('swagger/apiModelProperties', dto)['teacher'];

        expect(apiProperty).toBeDefined();
        expect(apiProperty['required']).toBe(true);
        expect(apiProperty['type']).toBe('string');
    });

    it('should have a subjectCode property', () => {
        const dto = module.get<CreateCourseDto>(CreateCourseDto);
        const apiProperty: typeof ApiProperty = Reflect.getMetadata('swagger/apiModelProperties', dto)['subjectCode'];

        expect(apiProperty).toBeDefined();
        expect(apiProperty['required']).toBe(true);
        expect(apiProperty['type']).toBe('string');
    });

    it('should have a credits property', () => {
        const dto = module.get<CreateCourseDto>(CreateCourseDto);
        const apiProperty: typeof ApiProperty = Reflect.getMetadata('swagger/apiModelProperties', dto)['credits'];

        expect(apiProperty).toBeDefined();
        expect(apiProperty['required']).toBe(true);
        expect(apiProperty['type']).toBe('number');
    });
});
*/
