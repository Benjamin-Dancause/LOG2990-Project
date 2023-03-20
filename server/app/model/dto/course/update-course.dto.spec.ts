import { UpdateCourseDto } from './update-course.dto';

describe('UpdateCourseDto', () => {
    it('should be defined', () => {
        const dto = new UpdateCourseDto();
        expect(dto).toBeDefined();
    });

    it('should set the name property', () => {
        const dto = new UpdateCourseDto();
        dto.name = 'Math';
        expect(dto.name).toEqual('Math');
    });

    it('should set the teacher property', () => {
        const dto = new UpdateCourseDto();
        dto.teacher = 'John';
        expect(dto.teacher).toEqual('John');
    });

    it('should set the subjectCode property', () => {
        const dto = new UpdateCourseDto();
        dto.subjectCode = 'MATH101';
        expect(dto.subjectCode).toEqual('MATH101');
    });

    it('should set the credits property', () => {
        const dto = new UpdateCourseDto();
        dto.credits = 3;
        expect(dto.credits).toEqual(3);
    });
});
